import type { CompanyProfile, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, updateCollection } from '../utils/store';
import { nextNumericId } from '../utils/id';
import { validateRequired } from '../utils/validator';
import { pick } from '../utils/fields';
import { jsonResponse, errorResponse, notFoundResponse, PUBLIC_CACHE } from '../response';

const EDITABLE_COMPANY_FIELDS: readonly (keyof CompanyProfile)[] = [
  'name', 'role', 'location', 'startDate', 'endDate', 'description', 'website', 'logo', 'displayOrder',
];

export async function handleGetCompanies(request: Request, env: Env): Promise<Response> {
  try {
    const companies = await readJson<CompanyProfile[]>(env, R2_KEYS.COMPANIES, []);
    return jsonResponse(request, env, companies, 200, PUBLIC_CACHE);
  } catch (error) {
    return errorResponse(request, env, `Failed to read companies: ${(error as Error).message}`, 500);
  }
}

export async function handleCreateCompany(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const missing = validateRequired(body, ['name', 'role']);
    if (missing) return errorResponse(request, env, `Missing required field: ${missing}`, 400);
    const fields = pick<CompanyProfile>(body, EDITABLE_COMPANY_FIELDS);

    const company = await updateCollection<CompanyProfile[], CompanyProfile>(env, R2_KEYS.COMPANIES, [], (companies) => {
      const id = nextNumericId(companies);
      const created: CompanyProfile = {
        ...(fields as CompanyProfile),
        id,
        displayOrder: typeof fields.displayOrder === 'number' ? fields.displayOrder : id,
      };
      companies.push(created);
      return { next: companies, result: created };
    });
    return jsonResponse(request, env, company, 201);
  } catch (error) {
    return errorResponse(request, env, `Failed to create company: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateCompany(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pick<CompanyProfile>(body, EDITABLE_COMPANY_FIELDS);

    const updated = await updateCollection<CompanyProfile[], CompanyProfile | null>(env, R2_KEYS.COMPANIES, [], (companies) => {
      const index = companies.findIndex((c) => c.id === numericId);
      if (index === -1) return { next: null, result: null };
      const merged: CompanyProfile = { ...companies[index], ...fields, id: numericId };
      companies[index] = merged;
      return { next: companies, result: merged };
    });
    if (!updated) return notFoundResponse(request, env, 'Company');
    return jsonResponse(request, env, updated);
  } catch (error) {
    return errorResponse(request, env, `Failed to update company: ${(error as Error).message}`, 500);
  }
}

export async function handleDeleteCompany(request: Request, env: Env, id: string): Promise<Response> {
  try {
    const numericId = Number(id);
    const deleted = await updateCollection<CompanyProfile[], boolean>(env, R2_KEYS.COMPANIES, [], (companies) => {
      const filtered = companies.filter((c) => c.id !== numericId);
      if (filtered.length === companies.length) return { next: null, result: false };
      return { next: filtered, result: true };
    });
    if (!deleted) return notFoundResponse(request, env, 'Company');
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to delete company: ${(error as Error).message}`, 500);
  }
}
