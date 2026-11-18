import type { Env } from '../types';
import { corsHeaders } from '../cors';

const IMMUTABLE = 'public, max-age=31536000, immutable';

/**
 * GET /media/<key> — serves an uploaded asset straight from the R2 binding.
 * Faster and not rate-limited compared with the public `pub-*.r2.dev` URL. Upload keys are
 * timestamped (never overwritten), so responses are cached by the browser for a year.
 * Only `assets/` keys are exposed — CMS JSON under `data/` stays API-only.
 */
export async function handleGetMedia(request: Request, env: Env, key: string): Promise<Response> {
  if (!key.startsWith('assets/') || key.includes('..')) {
    return new Response('Not found', { status: 404 });
  }

  const ifNoneMatch = request.headers.get('If-None-Match');
  const object = await env.CMS_BUCKET.get(key, {
    onlyIf: ifNoneMatch ? { etagDoesNotMatch: ifNoneMatch.replace(/^W\//, '').replace(/"/g, '') } : undefined,
  });

  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers(corsHeaders(request, env));
  object.writeHttpMetadata(headers);
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', IMMUTABLE);
  headers.set('X-Content-Type-Options', 'nosniff');

  // `onlyIf` precondition failed → R2 returns metadata without a body → 304.
  if (!('body' in object) || !object.body) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(object.body, { status: 200, headers });
}
