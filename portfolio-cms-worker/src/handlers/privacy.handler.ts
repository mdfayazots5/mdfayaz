import type { PrivacySection, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, updateCollection } from '../utils/store';
import { prefixedId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { pick } from '../utils/fields';
import { jsonResponse, errorResponse, notFoundResponse, PUBLIC_CACHE } from '../response';

const EDITABLE_PRIVACY_FIELDS: readonly (keyof PrivacySection)[] = ['title', 'body'];

export async function handleGetPrivacy(request: Request, env: Env): Promise<Response> {
  try {
    const privacy = await readJson<PrivacySection[]>(env, R2_KEYS.PRIVACY, []);
    return jsonResponse(request, env, privacy, 200, PUBLIC_CACHE);
  } catch (error) {
    return errorResponse(request, env, `Failed to read privacy sections: ${(error as Error).message}`, 500);
  }
}

export async function handleCreatePrivacy(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['title', 'body']); // M7
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);
    const fields = pick<PrivacySection>(body, EDITABLE_PRIVACY_FIELDS);

    const section = await updateCollection<PrivacySection[], PrivacySection>(env, R2_KEYS.PRIVACY, [], (privacy) => {
      const created: PrivacySection = { ...(fields as PrivacySection), id: prefixedId('priv') };
      privacy.push(created);
      return { next: privacy, result: created };
    });
    return jsonResponse(request, env, section, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create privacy section: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdatePrivacy(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pick<PrivacySection>(body, EDITABLE_PRIVACY_FIELDS);

    const updated = await updateCollection<PrivacySection[], PrivacySection | null>(env, R2_KEYS.PRIVACY, [], (privacy) => {
      const index = privacy.findIndex((section) => section.id === id);
      if (index === -1) return { next: null, result: null };
      const merged: PrivacySection = { ...privacy[index], ...fields, id };
      privacy[index] = merged;
      return { next: privacy, result: merged };
    });
    if (!updated) return notFoundResponse(request, env, 'Privacy section');
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update privacy section: ${(error as Error).message}`, 500);
  }
}

export async function handleDeletePrivacy(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const deleted = await updateCollection<PrivacySection[], boolean>(env, R2_KEYS.PRIVACY, [], (privacy) => {
      const filtered = privacy.filter((section) => section.id !== id);
      if (filtered.length === privacy.length) return { next: null, result: false };
      return { next: filtered, result: true };
    });
    if (!deleted) return notFoundResponse(request, env, 'Privacy section');
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete privacy section: ${(error as Error).message}`, 500);
  }
}

export async function handleReorderPrivacy(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as { orderedIds?: unknown };
    const orderedIds = Array.isArray(body.orderedIds) ? (body.orderedIds as string[]) : [];

    await updateCollection<PrivacySection[], true>(env, R2_KEYS.PRIVACY, [], (privacy) => {
      const reordered: PrivacySection[] = [];
      for (const id of orderedIds) {
        const section = privacy.find((s) => s.id === id);
        if (section) reordered.push(section);
      }
      // Append any sections not named in the payload so a partial reorder never drops data.
      for (const section of privacy) {
        if (!reordered.some((s) => s.id === section.id)) reordered.push(section);
      }
      return { next: reordered, result: true };
    });
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to reorder privacy sections: ${(error as Error).message}`, 500);
  }
}
