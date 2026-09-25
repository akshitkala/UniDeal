import { test, expect } from '@playwright/test';

test.describe('Flow 4: Auth Modal Login', () => {
  test('Wrong password shows inline error without page navigation', async ({ page }) => {
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();

    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[placeholder="Your password"]').fill('WrongPassword999!');

    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();

    await expect(page.locator('text=Invalid login credentials')).toBeVisible();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Valid login succeeds and updates header', async ({ page }) => {
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();

    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[placeholder="Your password"]').fill('UniDeal2026!Pass');

    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();
  });
});
