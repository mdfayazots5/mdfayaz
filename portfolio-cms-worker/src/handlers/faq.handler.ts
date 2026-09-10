import type { FaqItem, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, updateCollection } from '../utils/store';
import { nextNumericId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { pick } from '../utils/fields';
import { jsonResponse, errorResponse, notFoundResponse, PUBLIC_CACHE } from '../response';

const EDITABLE_FAQ_FIELDS: readonly (keyof FaqItem)[] = ['question', 'answer', 'category', 'published'];

export async function handleGetFaq(request: Request, env: Env): Promise<Response> {
  try {
    const faq = await readJson<FaqItem[]>(env, R2_KEYS.FAQ, []);
    return jsonResponse(request, env, faq, 200, PUBLIC_CACHE);
  } catch (error) {
    return errorResponse(request, env, `Failed to read FAQ: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateFaq(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['question', 'answer', 'category']);
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);
    const fields = pick<FaqItem>(body, EDITABLE_FAQ_FIELDS);

    const item = await updateCollection<FaqItem[], FaqItem>(env, R2_KEYS.FAQ, [], (faq) => {
      const created: FaqItem = { ...(fields as FaqItem), id: nextNumericId(faq) };
      faq.push(created);
      return { next: faq, result: created };
    });
    return jsonResponse(request, env, item, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create FAQ item: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateFaq(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pick<FaqItem>(body, EDITABLE_FAQ_FIELDS);

    const updated = await updateCollection<FaqItem[], FaqItem | null>(env, R2_KEYS.FAQ, [], (faq) => {
      const index = faq.findIndex((item) => item.id === numericId);
      if (index === -1) return { next: null, result: null };
      const merged: FaqItem = { ...faq[index], ...fields, id: numericId };
      faq[index] = merged;
      return { next: faq, result: merged };
    });
    if (!updated) return notFoundResponse(request, env, 'FAQ item');
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update FAQ item: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteFaq(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const deleted = await updateCollection<FaqItem[], boolean>(env, R2_KEYS.FAQ, [], (faq) => {
      const filtered = faq.filter((item) => item.id !== numericId);
      if (filtered.length === faq.length) return { next: null, result: false };
      return { next: filtered, result: true };
    });
    if (!deleted) return notFoundResponse(request, env, 'FAQ item');
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete FAQ item: ${(error as Error).message}`, 500);
  }
}
