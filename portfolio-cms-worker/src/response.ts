import type { Env } from './types';
import { corsHeaders } from './cors';
import { requireAuth } from './middleware/auth-guard';

// L1: applied to every response. Cheap defense-in-depth even for a JSON API.
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// L2: public CMS JSON: the browser may store it but must revalidate on EVERY use (`no-cache`).
// The ETag below turns an unchanged revalidation into an empty 304, so CMS edits reach visitors on
// their very next load at near-zero cost. Admin (authenticated) reads are `private, no-store`.
export const PUBLIC_CACHE = 'no-cache';
const ADMIN_CACHE = 'private, no-store';

/** Public visibility rule shared by every read: drafts (`published: false`) are admin-only. */
export const isPublished = (item: { published?: boolean }): boolean => item.published !== false;

/**
 * CMS read response. Authenticated admin requests get the full data (drafts included, never cached);
 * everyone else gets `publicView(data)` with ETag revalidation. Drafts never leave the Worker publicly.
 */
export async function cmsReadResponse<T>(
  request: Request,
  env: Env,
  data: T,
  publicView: (data: T) => T = (d) => d,
): Promise<Response> {
  if (await requireAuth(request, env)) {
    const res = jsonResponse(request, env, data, 200, ADMIN_CACHE);
    res.headers.set('Vary', 'Origin, Authorization');
    return res;
  }
  return publicJsonResponse(request, env, publicView(data));
}
const NO_STORE = 'no-store';

export function jsonResponse<T>(
  request: Request,
  env: Env,
  body: T,
  status = 200,
  cacheControl: string = NO_STORE,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      ...SECURITY_HEADERS,
      ...corsHeaders(request, env),
    },
  });
}

/**
 * Public, cacheable JSON with an ETag (SHA-1 of the body). Browsers keep the response for
 * PUBLIC_CACHE's max-age (5 min); after that they revalidate with If-None-Match and, when the
 * CMS content hasn't changed, get an empty 304 instead of the full payload.
 */
export async function publicJsonResponse<T>(request: Request, env: Env, body: T): Promise<Response> {
  const json = JSON.stringify(body);
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(json));
  const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  const etag = `"${hash}"`;

  const headers: Record<string, string> = {
    'Cache-Control': PUBLIC_CACHE,
    ETag: etag,
    ...SECURITY_HEADERS,
    ...corsHeaders(request, env),
    // Public and admin views of the same URL differ — never let one stand in for the other.
    Vary: 'Origin, Authorization',
  };

  const ifNoneMatch = request.headers.get('If-None-Match') || '';
  const matches = ifNoneMatch
    .split(',')
    .map((t) => t.trim().replace(/^W\//, ''))
    .includes(etag);
  if (matches) return new Response(null, { status: 304, headers });

  return new Response(json, { status: 200, headers: { 'Content-Type': 'application/json', ...headers } });
}

export function errorResponse(request: Request, env: Env, message: string, status: number): Response {
  return jsonResponse(request, env, { message }, status);
}

export function notFoundResponse(request: Request, env: Env, resource?: string): Response {
  const message = resource ? `${resource} not found` : 'Not found';
  return errorResponse(request, env, message, 404);
}
