import type { Env, LoginRequest } from '../types';
import { login } from '../auth';
import { jsonResponse, errorResponse } from '../response';
import { isRateLimited, recordFailure, clearFailures } from '../utils/rate-limit';

function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return errorResponse(request, env, 'Too many failed attempts. Try again later.', 429);
  }
  try {
    const body = (await request.json()) as LoginRequest;
    const result = await login(body, env);
    if (!result) {
      recordFailure(ip);
      return errorResponse(request, env, 'Invalid username or password', 401);
    }
    clearFailures(ip);
    return jsonResponse(request, env, result);
  } catch (error) {
    // Malformed body etc. — don't count against the IP, but surface a 400.
    return errorResponse(request, env, `Login failed: ${(error as Error).message}`, 400);
  }
}
