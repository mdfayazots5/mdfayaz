import type { Env, Entry, Service, CompanyProfile, AboutProfile, SiteSettings } from '../types';
import { R2_KEYS } from '../types';
import { readJson } from '../utils/store';
import { jsonResponse, errorResponse, PUBLIC_CACHE } from '../response';
import { DEFAULT_SETTINGS } from './settings.handler';
import { DEFAULT_ABOUT } from './about.handler';

/**
 * GET /bootstrap — everything the public home page needs in ONE round trip.
 * Reads the R2 objects in parallel; payload shapes are identical to the individual
 * GET endpoints (/settings, /entries, /about, /services, /companies).
 */
export async function handleGetBootstrap(request: Request, env: Env): Promise<Response> {
  try {
    const [settings, entries, about, services, companies] = await Promise.all([
      readJson<SiteSettings>(env, R2_KEYS.SETTINGS, DEFAULT_SETTINGS),
      readJson<Entry[]>(env, R2_KEYS.ENTRIES, []),
      readJson<AboutProfile>(env, R2_KEYS.ABOUT, DEFAULT_ABOUT),
      readJson<Service[]>(env, R2_KEYS.SERVICES, []),
      readJson<CompanyProfile[]>(env, R2_KEYS.COMPANIES, []),
    ]);
    return jsonResponse(request, env, { settings, entries, about, services, companies }, 200, PUBLIC_CACHE);
  } catch (error) {
    return errorResponse(request, env, `Failed to read bootstrap: ${(error as Error).message}`, 500);
  }
}
