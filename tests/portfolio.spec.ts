import { test, expect } from '@playwright/test';

test('portfolio type 1 (System Dashboard) renders correctly', async ({ page }) => {
  // Wait for server to be ready
  await new Promise(r => setTimeout(r, 5000));
  
  // Go to the app
  await page.goto('/');

  // Wait for the main content to appear
  await page.waitForSelector('text=System Overview', { timeout: 15000 });

  // Check if the name "Mohammed Fayaz" is visible
  await expect(page.getByText('Mohammed Fayaz').first()).toBeVisible();

  // Check if "System Overview" is visible (specific to Type 1)
  await expect(page.getByRole('heading', { name: 'System Overview' })).toBeVisible();

  // Check if the sidebar navigation exists
  const sidebar = page.locator('aside');
  await expect(sidebar).toBeVisible();

  // Check for specific KPI cards (e.g., "Modules Delivered")
  await expect(page.getByText('Modules Delivered')).toBeVisible();
});
