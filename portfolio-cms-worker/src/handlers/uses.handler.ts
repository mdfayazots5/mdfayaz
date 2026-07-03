import type { UsesCategory, UsesItem, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, writeJson } from '../utils/store';
import { prefixedId } from '../utils/id';
import { jsonResponse, errorResponse, notFoundResponse } from '../response';

export async function handleGetUses(request: Request, env: Env): Promise<Response> {
  try {
    const uses = await readJson<UsesCategory[]>(env, R2_KEYS.USES, []);
    return jsonResponse(request, env, uses);
  } catch (error) {
    return errorResponse(request, env, `Failed to read uses: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateUsesCategory(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const uses = await readJson<UsesCategory[]>(env, R2_KEYS.USES, []);
    const category: UsesCategory = {
      ...(body as unknown as UsesCategory),
      id: prefixedId('cat'),
      items: (body.items as UsesItem[]) || [],
    };
    uses.push(category);
    await writeJson(env, R2_KEYS.USES, uses);
    return jsonResponse(request, env, category, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create uses category: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateUsesCategory(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const uses = await readJson<UsesCategory[]>(env, R2_KEYS.USES, []);
    const index = uses.findIndex((category) => category.id === id);
    if (index === -1) return notFoundResponse(request, env, 'Uses category');

    const updated: UsesCategory = { ...uses[index], ...(body as unknown as UsesCategory), id };
    uses[index] = updated;
    await writeJson(env, R2_KEYS.USES, uses);
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update uses category: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteUsesCategory(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const uses = await readJson<UsesCategory[]>(env, R2_KEYS.USES, []);
    const filtered = uses.filter((category) => category.id !== id);
    await writeJson(env, R2_KEYS.USES, filtered);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete uses category: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateUsesItem(
  request: Request,
  env: Env,
  categoryId: string,
): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const uses = await readJson<UsesCategory[]>(env, R2_KEYS.USES, []);
    const categoryIndex = uses.findIndex((category) => category.id === categoryId);
    if (categoryIndex === -1) return notFoundResponse(request, env, 'Uses category');

    const item: UsesItem = { ...(body as unknown as UsesItem), id: prefixedId('item') };
    if (!uses[categoryIndex].items) uses[categoryIndex].items = [];
    uses[categoryIndex].items.push(item);
    await writeJson(env, R2_KEYS.USES, uses);
    return jsonResponse(request, env, item, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create uses item: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateUsesItem(
  request: Request,
  env: Env,
  categoryId: string,
  itemId: string,
): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const uses = await readJson<UsesCategory[]>(env, R2_KEYS.USES, []);
    const categoryIndex = uses.findIndex((category) => category.id === categoryId);
    if (categoryIndex === -1) return notFoundResponse(request, env, 'Uses category');

    const itemIndex = uses[categoryIndex].items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return notFoundResponse(request, env, 'Uses item');

    const updated: UsesItem = { ...uses[categoryIndex].items[itemIndex], ...(body as unknown as UsesItem), id: itemId };
    uses[categoryIndex].items[itemIndex] = updated;
    await writeJson(env, R2_KEYS.USES, uses);
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update uses item: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteUsesItem(
  request: Request,
  env: Env,
  categoryId: string,
  itemId: string,
): Promise<Response> {
  try {
    const uses = await readJson<UsesCategory[]>(env, R2_KEYS.USES, []);
    const categoryIndex = uses.findIndex((category) => category.id === categoryId);
    if (categoryIndex === -1) return notFoundResponse(request, env, 'Uses category');

    uses[categoryIndex].items = uses[categoryIndex].items.filter((item) => item.id !== itemId);
    await writeJson(env, R2_KEYS.USES, uses);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete uses item: ${(error as Error).message}`, 500);
  }
}
