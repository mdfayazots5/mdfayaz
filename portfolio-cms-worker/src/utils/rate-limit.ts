/**
 * M4: minimal login brute-force throttle.
 *
 * LIMITATION: this state lives in the isolate's memory, so it is per-isolate and per-region,
 * not globally shared. Cloudflare can spin up many isolates, so a determined attacker can dilute
 * it. It is a speed bump, not a wall — combined with PBKDF2's 100k-iteration cost per attempt it
 * meaningfully raises the bar. For a hard guarantee, move to Cloudflare's Rate Limiting binding
 * or a Durable Object.
 */
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface Attempt {
  count: number;
  firstAt: number;
}

const attempts = new Map<string, Attempt>();

export function isRateLimited(ip: string): boolean {
  const record = attempts.get(ip);
  if (!record) return false;
  if (Date.now() - record.firstAt > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return record.count >= MAX_FAILURES;
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now - record.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now });
    return;
  }
  record.count += 1;
}

export function clearFailures(ip: string): void {
  attempts.delete(ip);
}
