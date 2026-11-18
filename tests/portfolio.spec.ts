import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Offline E2E: the CMS Worker is mocked with the R2 seed JSON (portfolio-cms-worker/seed), so tests
 * are deterministic and never depend on the live API. A draft entry is injected to prove the public
 * site never renders unpublished content even if it were to arrive.
 */
const seed = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), 'portfolio-cms-worker', 'seed', `${name}.json`), 'utf8'));

const DRAFT_TITLE = 'Secret Draft Project';
const entries = [
  ...seed('entries'),
  { ...seed('entries')[0], id: 9999, title: DRAFT_TITLE, published: false, featured: true },
];
const data: Record<string, unknown> = {
  settings: seed('site-settings'),
  entries,
  about: seed('about'),
  services: seed('services'),
  companies: seed('companies'),
  faq: seed('faq'),
  uses: seed('uses'),
  privacy: seed('privacy'),
};

async function mockCms(page: Page) {
  await page.route(/workers\.dev\//, async (route) => {
    const { pathname } = new URL(route.request().url());
    const [resource, id] = pathname.split('/').filter(Boolean);
    let body: unknown;
    if (resource === 'bootstrap') {
      body = { settings: data.settings, entries, about: data.about, services: data.services, companies: data.companies };
    } else if (resource === 'entries' && id) {
      body = entries.find((e: { id: number }) => String(e.id) === id);
    } else {
      body = data[resource] ?? [];
    }
    await route.fulfill({
      status: body ? 200 : 404,
      headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' },
      body: JSON.stringify(body ?? { message: 'Not found' }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockCms(page);
});

test('home renders the CMS identity and hiring card', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Mohammed Fayaz' })).toBeVisible();
  await expect(page.getByText(/\.NET Full Stack Developer/i).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Looking for a .NET Full Stack Developer?' })).toBeVisible();
});

test('work tab renders published entries', async ({ page }) => {
  await page.goto('/#work');
  await expect(page.getByText('Healthcare Management System (HCM)').first()).toBeVisible();
  await expect(page.getByText('ASP.NET Core').first()).toBeVisible();
});

test('draft entries never render on the public site', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#featured-work')).toBeVisible();
  await expect(page.getByText(DRAFT_TITLE)).toHaveCount(0);
  await page.goto('/#work');
  await expect(page.getByText('Healthcare Management System (HCM)').first()).toBeVisible();
  await expect(page.getByText(DRAFT_TITLE)).toHaveCount(0);
});

test('nav menus mirror the footer groups', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav-about-dropdown-btn').click();
  const explore = page.locator('#nav-about-dropdown');
  for (const label of ['Home', 'About', 'Experience', 'Projects']) {
    await expect(explore.getByRole('heading', { name: label, exact: true })).toBeVisible();
  }
  await page.locator('#nav-work-dropdown-btn').click();
  const info = page.locator('#nav-work-dropdown');
  for (const label of ['Uses', 'FAQ', 'Privacy Policy', 'Contact']) {
    await expect(info.getByRole('heading', { name: label, exact: true })).toBeVisible();
  }
});

test('Back restores the scroll position after opening a project', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#featured-work')).toBeVisible();
  await page.mouse.move(400, 400);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(80);
  }
  // click() may auto-scroll the card clear of the fixed nav first, so record the scroll position at
  // the actual moment of the press — that's where Back should return the reader.
  await page.waitForTimeout(1200); // let Lenis' glide settle
  await page.evaluate(() =>
    document.addEventListener('pointerdown', () => ((window as any).__yAtClick = window.scrollY), { capture: true, once: true }),
  );
  await page.locator('#featured-work button').nth(1).click();
  const before = await page.evaluate(() => (window as any).__yAtClick as number);
  expect(before).toBeGreaterThan(300);
  await expect(page).toHaveURL(/#project\//);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);

  await page.goBack();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before - 5);
});
