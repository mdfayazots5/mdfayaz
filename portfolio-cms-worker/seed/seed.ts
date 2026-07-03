import { R2_KEYS } from '../src/types';
import type { Env } from '../src/types';
import entries from './entries.json';
import services from './services.json';
import about from './about.json';
import faq from './faq.json';
import uses from './uses.json';
import privacy from './privacy.json';
import siteSettings from './site-settings.json';

const SEED_DATA: Record<string, unknown> = {
  [R2_KEYS.ENTRIES]: entries,
  [R2_KEYS.SERVICES]: services,
  [R2_KEYS.ABOUT]: about,
  [R2_KEYS.FAQ]: faq,
  [R2_KEYS.USES]: uses,
  [R2_KEYS.PRIVACY]: privacy,
  [R2_KEYS.SETTINGS]: siteSettings,
};

export async function seed(env: Pick<Env, 'CMS_BUCKET'>): Promise<void> {
  for (const [key, value] of Object.entries(SEED_DATA)) {
    await env.CMS_BUCKET.put(key, JSON.stringify(value));
    console.log(`Seeded ${key}`);
  }
}

export default {
  async fetch(_request: Request, env: Env): Promise<Response> {
    await seed(env);
    return new Response('Seed complete', { status: 200 });
  },
};
