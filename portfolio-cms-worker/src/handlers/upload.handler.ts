import type { Env } from '../types';
import { jsonResponse, errorResponse } from '../response';
import { safeKeySegment } from '../utils/fields';

// M2: SVG intentionally excluded — it can carry <script> and would execute when served
// from the public R2 origin. Raster images + PDF only.
const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
};

// Content types we never want a browser to render inline from the asset origin.
const FORCE_DOWNLOAD = new Set(['application/pdf']);

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function extensionOf(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export async function handleUpload(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get('file') as unknown;
    const category = safeKeySegment((formData.get('category') as string) || '', 'general');

    if (!(fileEntry instanceof File)) {
      return errorResponse(request, env, 'Missing file in upload', 400);
    }
    const file = fileEntry;
    if (file.size > MAX_UPLOAD_BYTES) {
      return errorResponse(request, env, 'File exceeds 5MB limit', 400);
    }

    const extension = extensionOf(file.name);
    const contentType = ALLOWED_CONTENT_TYPES[extension];
    if (!contentType) {
      return errorResponse(request, env, `Unsupported file type: .${extension}`, 400);
    }

    // M3: sanitize the filename so it can't inject slashes/traversal/control chars into the R2 key.
    const safeName = safeKeySegment(file.name, `file.${extension}`);
    const key = `assets/${category}/${Date.now()}-${safeName}`;
    await env.CMS_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
        ...(FORCE_DOWNLOAD.has(contentType) ? { contentDisposition: 'attachment' } : {}),
      },
    });

    const url = `${env.R2_PUBLIC_URL}/${key}`;
    return jsonResponse(request, env, { url }, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to upload file: ${(error as Error).message}`, 500);
  }
}

function stripPublicUrlPrefix(value: string, env: Env): string {
  const prefix = `${env.R2_PUBLIC_URL}/`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export async function handleDeleteUpload(request: Request, env: Env, key: string): Promise<Response> {
  try {
    const target = stripPublicUrlPrefix(key, env);
    // H1: only ever delete uploaded assets. Without this guard, a valid token could delete
    // arbitrary keys — e.g. DELETE /upload/data/entries.json would wipe a whole collection.
    if (!target.startsWith('assets/')) {
      return errorResponse(request, env, 'Refusing to delete key outside assets/', 400);
    }
    await env.CMS_BUCKET.delete(target);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete upload: ${(error as Error).message}`, 500);
  }
}
