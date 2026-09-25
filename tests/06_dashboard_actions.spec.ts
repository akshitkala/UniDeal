import { test, expect } from '@playwright/test';

test.describe('Flow 7 & 8: Dashboard & Listing Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[placeholder="Your password"]').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();
  });

  test('Dashboard sections exist with plain-language empty states or item cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Seller Dashboard' })).toBeVisible();

    await page.locator('button:has-text("Under Review")').click();
    await expect(page.locator('text=No items under review')).toBeVisible();

    await page.locator('button:has-text("Sold")').click();
    await expect(page.locator('text=No items marked as sold')).toBeVisible();

    await page.locator('button:has-text("Rejected")').click();
    // Tab either shows empty state 'No rejected items' or rejected listing card with 'Rejection Reason:'
    const hasEmptyState = await page.locator('text=No rejected items').isVisible();
    const hasRejectedCard = await page.locator('text=Rejection Reason:').isVisible();
    expect(hasEmptyState || hasRejectedCard).toBeTruthy();
  });
});
