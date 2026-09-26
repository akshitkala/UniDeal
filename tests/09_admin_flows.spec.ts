import { test, expect } from '@playwright/test';

test.describe('Flow 13: Admin Console & Governance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[placeholder="Your password"]').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();
  });

  test('Admin Console loads and settings toggle moderation mode', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'UniDeal Admin Console' })).toBeVisible();

    await page.locator('button:has-text("Manual Review Queue")').click();
    await expect(page.locator('text=/Approval mode set to Manual Review/')).toBeVisible();

    await page.locator('button:has-text("Auto-Approve")').click();
    await expect(page.locator('text=/Approval mode set to Auto-Approve/')).toBeVisible();
  });

  test('Admin Queue & Reports pages render properly', async ({ page }) => {
    await page.goto('/admin/listings/pending');
    await expect(page.getByRole('heading', { name: 'Manual Review Queue' })).toBeVisible();

    await page.goto('/admin/reports');
    await expect(page.getByRole('heading', { name: 'Reported Listings Queue' })).toBeVisible();

    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
  });
});
