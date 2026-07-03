import type { PrivacySection, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, writeJson } from '../utils/store';
import { prefixedId } from '../utils/id';
import { jsonResponse, errorResponse, notFoundResponse } from '../response';

export async function handleGetPrivacy(request: Request, env: Env): Promise<Response> {
  try {
    const privacy = await readJson<PrivacySection[]>(env, R2_KEYS.PRIVACY, []);
    return jsonResponse(request, env, privacy);
  } catch (error) {
    return errorResponse(request, env, `Failed to read privacy sections: ${(error as Error).message}`, 500);
  }
}

export async function handleCreatePrivacy(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const privacy = await readJson<PrivacySection[]>(env, R2_KEYS.PRIVACY, []);
    const section: PrivacySection = { ...(body as unknown as PrivacySection), id: prefixedId('priv') };
    privacy.push(section);
    await writeJson(env, R2_KEYS.PRIVACY, privacy);
    return jsonResponse(request, env, section, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create privacy section: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdatePrivacy(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const privacy = await readJson<PrivacySection[]>(env, R2_KEYS.PRIVACY, []);
    const index = privacy.findIndex((section) => section.id === id);
    if (index === -1) return notFoundResponse(request, env, 'Privacy section');

    const updated: PrivacySection = { ...privacy[index], ...(body as unknown as PrivacySection), id };
    privacy[index] = updated;
    await writeJson(env, R2_KEYS.PRIVACY, privacy);
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update privacy section: ${(error as Error).message}`, 500);
  }
}

export async function handleDeletePrivacy(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const privacy = await readJson<PrivacySection[]>(env, R2_KEYS.PRIVACY, []);
    const filtered = privacy.filter((section) => section.id !== id);
    await writeJson(env, R2_KEYS.PRIVACY, filtered);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete privacy section: ${(error as Error).message}`, 500);
  }
}

export async function handleReorderPrivacy(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as { orderedIds: string[] };
    const privacy = await readJson<PrivacySection[]>(env, R2_KEYS.PRIVACY, []);
    const reordered: PrivacySection[] = [];
    for (const id of body.orderedIds) {
      const section = privacy.find((s) => s.id === id);
      if (section) reordered.push(section);
    }
    for (const section of privacy) {
      if (!reordered.find((s) => s.id === section.id)) reordered.push(section);
    }
    await writeJson(env, R2_KEYS.PRIVACY, reordered);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to reorder privacy sections: ${(error as Error).message}`, 500);
  }
}
