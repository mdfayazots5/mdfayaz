import type { Env, LoginRequest } from '../types';
import { login } from '../auth';
import { jsonResponse, errorResponse } from '../response';

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as LoginRequest;
    const result = await login(body, env);
    if (!result) return errorResponse(request, env, 'Invalid username or password', 401);
    return jsonResponse(request, env, result);
  } catch (error) {
    return errorResponse(request, env, `Login failed: ${(error as Error).message}`, 400);
  }
}
