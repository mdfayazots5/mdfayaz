import type { Service, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, updateCollection } from '../utils/store';
import { nextNumericId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { pick } from '../utils/fields';
import { jsonResponse, errorResponse, notFoundResponse, PUBLIC_CACHE } from '../response';

const EDITABLE_SERVICE_FIELDS: readonly (keyof Service)[] = [
  'name', 'tagline', 'description', 'highlights', 'icon', 'status', 'displayOrder',
];

export async function handleGetServices(request: Request, env: Env): Promise<Response> {
  try {
    const services = await readJson<Service[]>(env, R2_KEYS.SERVICES, []);
    return jsonResponse(request, env, services, 200, PUBLIC_CACHE);
  } catch (error) {
    return errorResponse(request, env, `Failed to read services: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateService(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['name', 'tagline', 'description']);
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);
    const fields = pick<Service>(body, EDITABLE_SERVICE_FIELDS);

    const service = await updateCollection<Service[], Service>(env, R2_KEYS.SERVICES, [], (services) => {
      const id = nextNumericId(services);
      const created: Service = {
        ...(fields as Service),
        id,
        status: fields.status || 'Active',
        icon: fields.icon || 'Server',
        displayOrder: typeof fields.displayOrder === 'number' ? fields.displayOrder : id,
        highlights: fields.highlights ?? [],
      };
      services.push(created);
      return { next: services, result: created };
    });
    return jsonResponse(request, env, service, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create service: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateService(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pick<Service>(body, EDITABLE_SERVICE_FIELDS);

    const updated = await updateCollection<Service[], Service | null>(env, R2_KEYS.SERVICES, [], (services) => {
      const index = services.findIndex((service) => service.id === numericId);
      if (index === -1) return { next: null, result: null };
      const merged: Service = { ...services[index], ...fields, id: numericId };
      services[index] = merged;
      return { next: services, result: merged };
    });
    if (!updated) return notFoundResponse(request, env, 'Service');
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update service: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteService(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const deleted = await updateCollection<Service[], boolean>(env, R2_KEYS.SERVICES, [], (services) => {
      const filtered = services.filter((service) => service.id !== numericId);
      if (filtered.length === services.length) return { next: null, result: false };
      return { next: filtered, result: true };
    });
    if (!deleted) return notFoundResponse(request, env, 'Service');
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete service: ${(error as Error).message}`, 500);
  }
}
