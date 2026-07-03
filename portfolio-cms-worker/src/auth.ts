import type { Env, LoginRequest, LoginResponse } from './types';

const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH_BITS = 256;
const JWT_EXPIRY_SECONDS = 24 * 60 * 60;

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (padded.length % 4)) % 4);
  return fromBase64(padded + padding);
}

function textToBase64Url(text: string): string {
  return toBase64Url(new TextEncoder().encode(text));
}

function base64UrlToText(value: string): string {
  return new TextDecoder().decode(fromBase64Url(value));
}

async function derivePbkdf2Key(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
  return new Uint8Array(derivedBits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await derivePbkdf2Key(password, salt);
  return `${toBase64(salt)}:${toBase64(derived)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [saltB64, hashB64] = stored.split(':');
    if (!saltB64 || !hashB64) return false;
    const salt = fromBase64(saltB64);
    const derived = await derivePbkdf2Key(password, salt);
    const expected = fromBase64(hashB64);
    if (derived.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < derived.length; i++) diff |= derived[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return toBase64Url(signature);
}

export async function createJwt(env: Env): Promise<{ token: string; expiresAt: string }> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + JWT_EXPIRY_SECONDS;
  const header = textToBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = textToBase64Url(JSON.stringify({ sub: 'admin', iat, exp }));
  const signature = await hmacSign(`${header}.${payload}`, env.JWT_SECRET);
  const token = `${header}.${payload}.${signature}`;
  return { token, expiresAt: new Date(exp * 1000).toISOString() };
}

export async function verifyJwt(token: string, env: Env): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    const expectedSignature = await hmacSign(`${header}.${payload}`, env.JWT_SECRET);
    if (signature !== expectedSignature) return false;
    const decoded = JSON.parse(base64UrlToText(payload)) as { exp?: number };
    if (typeof decoded.exp !== 'number') return false;
    return decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function login(body: LoginRequest, env: Env): Promise<LoginResponse | null> {
  if (body.username !== env.ADMIN_USERNAME) return null;
  const valid = await verifyPassword(body.password, env.ADMIN_PASSWORD_HASH);
  if (!valid) return null;
  return createJwt(env);
}

/** Dev-only utility to print a password hash for the Configuration phase. */
export async function generateHash(password: string): Promise<string> {
  return hashPassword(password);
}
