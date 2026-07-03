import type { Env } from '../types';
import { jsonResponse, errorResponse } from '../response';

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function extensionOf(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export async function handleUpload(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get('file') as unknown;
    const category = (formData.get('category') as string) || 'general';

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

    const key = `assets/${category}/${Date.now()}-${file.name}`;
    await env.CMS_BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType },
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
    await env.CMS_BUCKET.delete(stripPublicUrlPrefix(key, env));
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete upload: ${(error as Error).message}`, 500);
  }
}
