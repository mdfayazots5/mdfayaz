import type { UsesCategory, UsesItem, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, updateCollection } from '../utils/store';
import { prefixedId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { pick } from '../utils/fields';
import { jsonResponse, errorResponse, notFoundResponse, PUBLIC_CACHE } from '../response';

const EDITABLE_CATEGORY_FIELDS: readonly (keyof UsesCategory)[] = ['name', 'subtitle', 'published'];
const EDITABLE_ITEM_FIELDS: readonly (keyof UsesItem)[] = ['name', 'description', 'tag'];

export async function handleGetUses(request: Request, env: Env): Promise<Response> {
  try {
    const uses = await readJson<UsesCategory[]>(env, R2_KEYS.USES, []);
    return jsonResponse(request, env, uses, 200, PUBLIC_CACHE);
  } catch (error) {
    return errorResponse(request, env, `Failed to read uses: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateUsesCategory(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['name']); // M7
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);
    const fields = pick<UsesCategory>(body, EDITABLE_CATEGORY_FIELDS);
    const items = Array.isArray(body.items) ? (body.items as UsesItem[]) : [];

    const category = await updateCollection<UsesCategory[], UsesCategory>(env, R2_KEYS.USES, [], (uses) => {
      const created: UsesCategory = { ...(fields as UsesCategory), id: prefixedId('cat'), items };
      uses.push(created);
      return { next: uses, result: created };
    });
    return jsonResponse(request, env, category, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create uses category: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateUsesCategory(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pick<UsesCategory>(body, EDITABLE_CATEGORY_FIELDS);

    const updated = await updateCollection<UsesCategory[], UsesCategory | null>(env, R2_KEYS.USES, [], (uses) => {
      const index = uses.findIndex((category) => category.id === id);
      if (index === -1) return { next: null, result: null };
      const merged: UsesCategory = { ...uses[index], ...fields, id };
      uses[index] = merged;
      return { next: uses, result: merged };
    });
    if (!updated) return notFoundResponse(request, env, 'Uses category');
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update uses category: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteUsesCategory(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const deleted = await updateCollection<UsesCategory[], boolean>(env, R2_KEYS.USES, [], (uses) => {
      const filtered = uses.filter((category) => category.id !== id);
      if (filtered.length === uses.length) return { next: null, result: false };
      return { next: filtered, result: true };
    });
    if (!deleted) return notFoundResponse(request, env, 'Uses category');
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete uses category: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateUsesItem(request: Request, env: Env, categoryId: string): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['name']); // M7
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);
    const fields = pick<UsesItem>(body, EDITABLE_ITEM_FIELDS);

    const result = await updateCollection<UsesCategory[], UsesItem | null>(env, R2_KEYS.USES, [], (uses) => {
      const categoryIndex = uses.findIndex((category) => category.id === categoryId);
      if (categoryIndex === -1) return { next: null, result: null };
      const item: UsesItem = { ...(fields as UsesItem), id: prefixedId('item') };
      if (!uses[categoryIndex].items) uses[categoryIndex].items = [];
      uses[categoryIndex].items.push(item);
      return { next: uses, result: item };
    });
    if (!result) return notFoundResponse(request, env, 'Uses category');
    return jsonResponse(request, env, result, 201);
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
    const fields = pick<UsesItem>(body, EDITABLE_ITEM_FIELDS);

    // 'missing-category' vs 'missing-item' lets us return the right 404 message after the write attempt.
    const result = await updateCollection<UsesCategory[], UsesItem | 'no-category' | 'no-item'>(
      env,
      R2_KEYS.USES,
      [],
      (uses) => {
        const categoryIndex = uses.findIndex((category) => category.id === categoryId);
        if (categoryIndex === -1) return { next: null, result: 'no-category' };
        const itemIndex = uses[categoryIndex].items.findIndex((item) => item.id === itemId);
        if (itemIndex === -1) return { next: null, result: 'no-item' };
        const merged: UsesItem = { ...uses[categoryIndex].items[itemIndex], ...fields, id: itemId };
        uses[categoryIndex].items[itemIndex] = merged;
        return { next: uses, result: merged };
      },
    );
    if (result === 'no-category') return notFoundResponse(request, env, 'Uses category');
    if (result === 'no-item') return notFoundResponse(request, env, 'Uses item');
    return jsonResponse(request, env, result);
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
    const result = await updateCollection<UsesCategory[], 'ok' | 'no-category'>(env, R2_KEYS.USES, [], (uses) => {
      const categoryIndex = uses.findIndex((category) => category.id === categoryId);
      if (categoryIndex === -1) return { next: null, result: 'no-category' };
      uses[categoryIndex].items = uses[categoryIndex].items.filter((item) => item.id !== itemId);
      return { next: uses, result: 'ok' };
    });
    if (result === 'no-category') return notFoundResponse(request, env, 'Uses category');
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete uses item: ${(error as Error).message}`, 500);
  }
}
