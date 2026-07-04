import type { Env } from '../types';

/** Read + parse a JSON value from R2, returning `fallback` when missing or corrupt. */
export async function readJson<T>(env: Env, key: string, fallback: T): Promise<T> {
  const { value } = await readJsonWithEtag(env, key, fallback);
  return value;
}

/** Like `readJson`, but also returns the R2 object's etag (null when the key doesn't exist yet). */
async function readJsonWithEtag<T>(
  env: Env,
  key: string,
  fallback: T,
): Promise<{ value: T; etag: string | null }> {
  const object = await env.CMS_BUCKET.get(key);
  if (!object) return { value: fallback, etag: null };
  try {
    const text = await object.text();
    return { value: JSON.parse(text) as T, etag: object.etag };
  } catch {
    // Corrupt JSON: treat as fallback but keep the etag so a write still guards against
    // clobbering a concurrent repair.
    return { value: fallback, etag: object.etag };
  }
}

export async function writeJson<T>(env: Env, key: string, value: T): Promise<void> {
  await env.CMS_BUCKET.put(key, JSON.stringify(value));
}

/**
 * M1: concurrency-safe read-modify-write. Reads the current collection (with its etag),
 * runs `mutate` to produce the next state plus a result to return, then writes conditionally
 * on the etag. If a concurrent request wrote in between (etag mismatch → put returns null),
 * it retries with fresh data. This turns silent last-writer-wins data loss into a bounded,
 * correct retry loop.
 *
 * `mutate` may return `{ next: null }` to abort the write (e.g. item not found) and surface a
 * result without touching R2.
 */
export async function updateCollection<T, R>(
  env: Env,
  key: string,
  fallback: T,
  mutate: (current: T) => { next: T | null; result: R },
  maxAttempts = 5,
): Promise<R> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { value, etag } = await readJsonWithEtag(env, key, fallback);
    const { next, result } = mutate(value);
    if (next === null) return result; // aborted — nothing to persist

    const written = await env.CMS_BUCKET.put(key, JSON.stringify(next), {
      // Guard the write: when the object exists, only overwrite the exact version we read.
      // When it doesn't exist yet (etag null), skip the guard — first-write races are rare
      // and self-heal on the next mutation.
      ...(etag ? { onlyIf: { etagMatches: etag } } : {}),
    });
    if (written !== null) return result;
    // etag moved: another writer won this round — loop and re-read.
  }
  throw new Error('Write conflict: exceeded retry attempts');
}
