import { test, expect } from '@playwright/test';

test('home page loads and UI elements exist', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer').getByText('BluebottleCap')).toBeVisible();
  await expect(page.locator('textarea[placeholder="Paste your paragraph or notes here…"]')).toBeVisible();
  await expect(page.locator('button', { hasText: 'Rewrite' })).toBeVisible();
});
