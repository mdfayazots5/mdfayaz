import type { Env } from './types';
import { corsHeaders } from './cors';

// L1: applied to every response. Cheap defense-in-depth even for a JSON API.
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// L2: public GETs opt into caching; everything else defaults to no-store.
export const PUBLIC_CACHE = 'public, max-age=300, s-maxage=3600';
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

export function errorResponse(request: Request, env: Env, message: string, status: number): Response {
  return jsonResponse(request, env, { message }, status);
}

export function notFoundResponse(request: Request, env: Env, resource?: string): Response {
  const message = resource ? `${resource} not found` : 'Not found';
  return errorResponse(request, env, message, 404);
}
