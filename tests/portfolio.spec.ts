import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// The public site is fully admin-driven: identity comes from Site Settings and
// the experience list comes from Entries (both seeded from the local fallback
// data on first run). These tests assert that seeded content renders.

test('home renders the admin-driven identity', async ({ page }) => {
  await page.goto('/');

  // Name comes from Site Settings (falls back to seed "Mohammed Fayaz").
  await expect(page.getByText('Mohammed Fayaz').first()).toBeVisible({ timeout: 15000 });

  // The About hero shows the active perspective role.
  await expect(
    page.getByText('System Architect & .NET Engineer').first()
  ).toBeVisible({ timeout: 15000 });
});

test('work tab renders admin-driven entries', async ({ page }) => {
  await page.goto('/#work');

  // A seeded company Entry should render via ProjectCard.
  await expect(
    page.getByRole('heading', { name: 'Healthcare Management System (HCM)' })
  ).toBeVisible({ timeout: 15000 });

  // Tech-stack pills prove the entry's structured fields render.
  await expect(page.getByText('ASP.NET Core').first()).toBeVisible();
});
