import type { Env } from '../types';

export async function readJson<T>(env: Env, key: string, fallback: T): Promise<T> {
  try {
    const object = await env.CMS_BUCKET.get(key);
    if (!object) return fallback;
    const text = await object.text();
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(env: Env, key: string, value: T): Promise<void> {
  await env.CMS_BUCKET.put(key, JSON.stringify(value));
}
