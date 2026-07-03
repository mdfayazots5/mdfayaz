import type { Env } from './types';
import { corsHeaders } from './cors';

export function jsonResponse<T>(request: Request, env: Env, body: T, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
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
