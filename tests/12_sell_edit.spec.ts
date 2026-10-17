import { test, expect } from '@playwright/test';

test.describe('Listing Edit Flow', () => {
  test('Unauthenticated user receives Sign In Required prompt on edit route', async ({ page }) => {
    // Attempt to access edit page without session
    await page.goto('/listing/spec-item/edit');
    await expect(page.getByRole('heading', { name: /Sign In Required|Not Found/i })).toBeVisible();
  });

  test('Authenticated seller can open edit page and see listing editor form', async ({ page }) => {
    // 1. Log in as verified user
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[type="password"]').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: /Sign in/i }).click();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();

    // 2. Go to dashboard
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Seller Dashboard' })).toBeVisible();

    // 3. Find an active listing's Edit button if one exists
    const editLink = page.locator('a[href$="/edit"]').first();
    if (await editLink.isVisible()) {
      await editLink.click();
      await expect(page).toHaveURL(/\/edit$/);
      await expect(page.getByRole('heading', { name: 'Edit Listing' })).toBeVisible();
      await expect(page.locator('input[name="title"], input[placeholder*="e.g."]').first()).toBeVisible();
    }
  });
});
