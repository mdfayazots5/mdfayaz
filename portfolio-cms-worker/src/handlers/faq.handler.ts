import type { FaqItem, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, writeJson } from '../utils/store';
import { nextNumericId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { jsonResponse, errorResponse, notFoundResponse } from '../response';

export async function handleGetFaq(request: Request, env: Env): Promise<Response> {
  try {
    const faq = await readJson<FaqItem[]>(env, R2_KEYS.FAQ, []);
    return jsonResponse(request, env, faq);
  } catch (error) {
    return errorResponse(request, env, `Failed to read FAQ: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateFaq(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['question', 'answer', 'category']);
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);

    const faq = await readJson<FaqItem[]>(env, R2_KEYS.FAQ, []);
    const id = nextNumericId(faq);
    const item: FaqItem = { ...(body as unknown as FaqItem), id };
    faq.push(item);
    await writeJson(env, R2_KEYS.FAQ, faq);
    return jsonResponse(request, env, item, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create FAQ item: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateFaq(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const body = (await request.json()) as Record<string, unknown>;
    const faq = await readJson<FaqItem[]>(env, R2_KEYS.FAQ, []);
    const index = faq.findIndex((item) => item.id === numericId);
    if (index === -1) return notFoundResponse(request, env, 'FAQ item');

    const updated: FaqItem = { ...faq[index], ...(body as unknown as FaqItem), id: numericId };
    faq[index] = updated;
    await writeJson(env, R2_KEYS.FAQ, faq);
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update FAQ item: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteFaq(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const faq = await readJson<FaqItem[]>(env, R2_KEYS.FAQ, []);
    const filtered = faq.filter((item) => item.id !== numericId);
    await writeJson(env, R2_KEYS.FAQ, filtered);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete FAQ item: ${(error as Error).message}`, 500);
  }
}
