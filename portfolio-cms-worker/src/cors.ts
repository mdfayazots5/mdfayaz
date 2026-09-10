import type { Env } from './types';

export function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowedOrigins = [env.ALLOWED_ORIGIN_DEV, env.ALLOWED_ORIGIN_PROD].filter(Boolean);

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  // Only reflect the Origin when it is explicitly allow-listed. For disallowed or
  // absent origins we omit the header entirely, so the browser blocks the response
  // rather than us silently vouching for the prod origin (previous fall-open behavior).
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export function handlePreflight(request: Request, env: Env): Response | null {
  if (request.method !== 'OPTIONS') return null;
  return new Response(null, { status: 204, headers: corsHeaders(request, env) });
}
