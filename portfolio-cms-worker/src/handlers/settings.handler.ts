import type { SiteSettings, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, writeJson } from '../utils/store';
import { jsonResponse, errorResponse, PUBLIC_CACHE } from '../response';

const DEFAULT_SETTINGS: SiteSettings = {
  name: '',
  role: '',
  location: '',
  availability: '',
  openToRelocation: false,
  yearsExperience: '',
  blog: '',
  contactEmail: '',
  socialLinks: { github: '', linkedin: '', dob: '', mobile: '' },
  resumeUrl: '',
  tagline: '',
  profileImage: { desktop: '', mobile: '' },
  heroBackground: { desktop: '', mobile: '' },
  themeSet: 'slate-classic',
};

export async function handleGetSettings(request: Request, env: Env): Promise<Response> {
  try {
    const settings = await readJson<SiteSettings>(env, R2_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return jsonResponse(request, env, settings, 200, PUBLIC_CACHE);
  } catch (error) {
    return errorResponse(request, env, `Failed to read settings: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateSettings(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as SiteSettings;
    await writeJson(env, R2_KEYS.SETTINGS, body);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to update settings: ${(error as Error).message}`, 500);
  }
}
