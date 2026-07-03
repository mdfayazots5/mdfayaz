import type { AboutProfile, Env } from '../types';
import { R2_KEYS } from '../types';
import { readJson, writeJson } from '../utils/store';
import { jsonResponse, errorResponse } from '../response';

const DEFAULT_ABOUT: AboutProfile = {
  tagline: '',
  architectBio: '',
  leadBio: '',
  developerBio: '',
  skills: [],
  experienceTimeline: [],
};

export async function handleGetAbout(request: Request, env: Env): Promise<Response> {
  try {
    const about = await readJson<AboutProfile>(env, R2_KEYS.ABOUT, DEFAULT_ABOUT);
    return jsonResponse(request, env, about);
  } catch (error) {
    return errorResponse(request, env, `Failed to read about profile: ${(error as Error).message}`, 500);
  }
}

export async function handleUpdateAbout(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as AboutProfile;
    await writeJson(env, R2_KEYS.ABOUT, body);
    return jsonResponse(request, env, { success: true });
  } catch (error) {
    return errorResponse(request, env, `Failed to update about profile: ${(error as Error).message}`, 500);
  }
}
