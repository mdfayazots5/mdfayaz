import type { Entry, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, updateCollection } from '../utils/store';
import { nextNumericId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { pick } from '../utils/fields';
import { jsonResponse, errorResponse, notFoundResponse, PUBLIC_CACHE } from '../response';

// Fields a client is allowed to set/change on an Entry. `id` is server-owned.
const EDITABLE_ENTRY_FIELDS: readonly (keyof Entry)[] = [
  'type', 'title', 'tagline', 'categoryTag', 'description', 'features', 'tech',
  'achievements', 'companyName', 'role', 'teamSize', 'startDate', 'endDate',
  'status', 'audience', 'liveUrl', 'repoUrl', 'caseStudyUrl', 'videoUrl',
  'coverImage', 'icon', 'color', 'featured', 'displayOrder',
];

export async function handleGetEntries(request: Request, env: Env): Promise<Response> {
  try {
    const entries = await readJson<Entry[]>(env, R2_KEYS.ENTRIES, []);
    return jsonResponse(request, env, entries, 200, PUBLIC_CACHE);
  } catch (error) {
    return errorResponse(request, env, `Failed to read entries: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateEntry(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['type', 'title', 'description']);
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);
    const fields = pick<Entry>(body, EDITABLE_ENTRY_FIELDS);

    const entry = await updateCollection<Entry[], Entry>(env, R2_KEYS.ENTRIES, [], (entries) => {
      const id = nextNumericId(entries);
      const created: Entry = {
        ...(fields as Entry),
        id,
        displayOrder: typeof fields.displayOrder === 'number' ? fields.displayOrder : id,
        icon: fields.icon || 'Briefcase',
        color: fields.color || '#0EA5E9',
        features: fields.features ?? [],
        tech: fields.tech ?? [],
        achievements: fields.achievements ?? [],
        featured: !!fields.featured,
      };
      entries.push(created);
      return { next: entries, result: created };
    });
    return jsonResponse(request, env, entry, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create entry: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateEntry(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pick<Entry>(body, EDITABLE_ENTRY_FIELDS);

    const updated = await updateCollection<Entry[], Entry | null>(env, R2_KEYS.ENTRIES, [], (entries) => {
      const index = entries.findIndex((entry) => entry.id === numericId);
      if (index === -1) return { next: null, result: null };
      const merged: Entry = { ...entries[index], ...fields, id: numericId };
      entries[index] = merged;
      return { next: entries, result: merged };
    });
    if (!updated) return notFoundResponse(request, env, 'Entry');
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update entry: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteEntry(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const deleted = await updateCollection<Entry[], boolean>(env, R2_KEYS.ENTRIES, [], (entries) => {
      const filtered = entries.filter((entry) => entry.id !== numericId);
      if (filtered.length === entries.length) return { next: null, result: false };
      return { next: filtered, result: true };
    });
    if (!deleted) return notFoundResponse(request, env, 'Entry');
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete entry: ${(error as Error).message}`, 500);
  }
}
