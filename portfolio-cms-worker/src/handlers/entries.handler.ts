import type { Entry, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, writeJson } from '../utils/store';
import { nextNumericId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { jsonResponse, errorResponse, notFoundResponse } from '../response';

export async function handleGetEntries(request: Request, env: Env): Promise<Response> {
  try {
    const entries = await readJson<Entry[]>(env, R2_KEYS.ENTRIES, []);
    return jsonResponse(request, env, entries);
  } catch (error) {
    return errorResponse(request, env, `Failed to read entries: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateEntry(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['type', 'title', 'description']);
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);

    const entries = await readJson<Entry[]>(env, R2_KEYS.ENTRIES, []);
    const id = nextNumericId(entries);
    const entry: Entry = {
      ...(body as unknown as Entry),
      id,
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : id,
      icon: (body.icon as string) || 'Briefcase',
      color: (body.color as string) || '#0EA5E9',
      features: (body.features as string[]) || [],
      tech: (body.tech as string[]) || [],
      achievements: (body.achievements as string[]) || [],
      featured: !!body.featured,
    };
    entries.push(entry);
    await writeJson(env, R2_KEYS.ENTRIES, entries);
    return jsonResponse(request, env, entry, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create entry: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateEntry(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const body = (await request.json()) as Record<string, unknown>;
    const entries = await readJson<Entry[]>(env, R2_KEYS.ENTRIES, []);
    const index = entries.findIndex((entry) => entry.id === numericId);
    if (index === -1) return notFoundResponse(request, env, 'Entry');

    const updated: Entry = { ...entries[index], ...(body as unknown as Entry), id: numericId };
    entries[index] = updated;
    await writeJson(env, R2_KEYS.ENTRIES, entries);
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update entry: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteEntry(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const entries = await readJson<Entry[]>(env, R2_KEYS.ENTRIES, []);
    const filtered = entries.filter((entry) => entry.id !== numericId);
    await writeJson(env, R2_KEYS.ENTRIES, filtered);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete entry: ${(error as Error).message}`, 500);
  }
}
