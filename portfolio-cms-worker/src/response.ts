import type { Env } from './types';
import { corsHeaders } from './cors';

// L1: applied to every response. Cheap defense-in-depth even for a JSON API.
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// L2: public CMS JSON may be cached briefly by browsers. The admin editor always requests with
// `cache: "no-store"` (see src/services/api.ts), so saved changes still appear immediately there.
// Public visitors reuse a response for 5 min, then revalidate via ETag (304 when unchanged), so
// CMS edits reach visitors within ~5 min. `Vary: Origin` (cors.ts) keeps CORS responses separate.
export const PUBLIC_CACHE = 'public, max-age=300, stale-while-revalidate=600';
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
