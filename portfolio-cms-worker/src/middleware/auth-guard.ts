import type { Env } from '../types';
import { verifyJwt } from '../auth';

export async function requireAuth(request: Request, env: Env): Promise<boolean> {
  const header = request.headers.get('Authorization');
  if (!header || !header.startsWith('Bearer ')) return false;
  const token = header.slice('Bearer '.length).trim();
  if (!token) return false;
  return verifyJwt(token, env);
}
