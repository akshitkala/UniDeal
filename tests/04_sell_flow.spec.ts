import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Flow 5: Sell Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as verified user
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[placeholder="Your password"]').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();
  });

  test('Inline validation on empty submit', async ({ page }) => {
    await page.goto('/sell');
    await page.locator('button:has-text("Post Listing")').click();

    await expect(page.locator('text=Title must be at least 3 characters')).toBeVisible();
    await expect(page.locator('text=Description must be at least 10 characters')).toBeVisible();
  });

  test('Client-side size rejection for >5MB image', async ({ page }) => {
    await page.goto('/sell');
    const largeImagePath = path.join(__dirname, '..', 'scratch', 'large-image.png');
    await page.locator('input[type="file"]').setInputFiles(largeImagePath);

    await expect(page.locator('text=exceeds the 5MB size limit')).toBeVisible();
  });

  test('Submitting valid listing', async ({ page }) => {
    await page.goto('/sell');
    const testImagePath = path.join(__dirname, '..', 'scratch', 'test-image.png');
    await page.locator('input[type="file"]').setInputFiles(testImagePath);

    await page.locator('input[placeholder="e.g. Casio Scientific Calculator fx-991EX"]').fill(`Spec Item ${Date.now()}`);
    await page.locator('input[type="number"]').fill('500');
    await page.locator('textarea').fill('Spec listing description for Playwright test suite.');

    await page.locator('button:has-text("Post Listing")').click();
    await expect(page).toHaveURL(/\/listing\//);
  });
});
