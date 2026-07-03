import type { Service, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, writeJson } from '../utils/store';
import { nextNumericId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { jsonResponse, errorResponse, notFoundResponse } from '../response';

export async function handleGetServices(request: Request, env: Env): Promise<Response> {
  try {
    const services = await readJson<Service[]>(env, R2_KEYS.SERVICES, []);
    return jsonResponse(request, env, services);
  } catch (error) {
    return errorResponse(request, env, `Failed to read services: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateService(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['name', 'tagline', 'description']);
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);

    const services = await readJson<Service[]>(env, R2_KEYS.SERVICES, []);
    const id = nextNumericId(services);
    const service: Service = {
      ...(body as unknown as Service),
      id,
      status: (body.status as Service['status']) || 'Active',
      icon: (body.icon as string) || 'Server',
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : id,
      highlights: (body.highlights as string[]) || [],
    };
    services.push(service);
    await writeJson(env, R2_KEYS.SERVICES, services);
    return jsonResponse(request, env, service, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create service: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateService(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const body = (await request.json()) as Record<string, unknown>;
    const services = await readJson<Service[]>(env, R2_KEYS.SERVICES, []);
    const index = services.findIndex((service) => service.id === numericId);
    if (index === -1) return notFoundResponse(request, env, 'Service');

    const updated: Service = { ...services[index], ...(body as unknown as Service), id: numericId };
    services[index] = updated;
    await writeJson(env, R2_KEYS.SERVICES, services);
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update service: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteService(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const services = await readJson<Service[]>(env, R2_KEYS.SERVICES, []);
    const filtered = services.filter((service) => service.id !== numericId);
    await writeJson(env, R2_KEYS.SERVICES, filtered);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete service: ${(error as Error).message}`, 500);
  }
}
