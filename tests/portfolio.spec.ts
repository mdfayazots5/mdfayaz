import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('home renders the admin-driven identity', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Mohammed Fayaz').first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/\.NET Full Stack Developer/i).first()).toBeVisible({ timeout: 15000 });
});

test('work tab renders admin-driven entries', async ({ page }) => {
  await page.goto('/#work');

  await expect(page.getByText('Healthcare Management System (HCM)').first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('ASP.NET Core').first()).toBeVisible();
});
