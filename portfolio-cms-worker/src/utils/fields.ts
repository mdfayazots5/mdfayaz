/**
 * M6: return a new object containing only the allow-listed keys that are actually present
 * in `body`. Prevents clients from persisting arbitrary junk fields into stored JSON and
 * keeps the `as unknown as T` casts honest.
 */
export function pick<T>(
  body: Record<string, unknown>,
  keys: readonly (keyof T)[],
): Partial<T> {
  const out: Partial<T> = {};
  for (const key of keys) {
    const k = key as string;
    if (Object.prototype.hasOwnProperty.call(body, k)) {
      (out as Record<string, unknown>)[k] = body[k];
    }
  }
  return out;
}

/** M3: turn an arbitrary string into a safe R2 key segment (no slashes, traversal, or control chars). */
export function safeKeySegment(value: string, fallback: string): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-') // collapse anything unsafe to a hyphen
    .replace(/\.{2,}/g, '.') // no `..`
    .replace(/^[-.]+|[-.]+$/g, '') // no leading/trailing separators
    .slice(0, 100);
  return cleaned.length > 0 ? cleaned : fallback;
}
