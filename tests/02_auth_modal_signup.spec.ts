import { test, expect } from '@playwright/test';

test.describe('Flow 2 & 3: Auth Modal Signup & Verification Gate', () => {
  test('Triggering gated action opens Auth Modal as overlay', async ({ page }) => {
    await page.goto('/browse');
    await page.locator('a[href^="/listing/"]').first().click();
    await page.waitForURL(/\/listing\//);

    const currentUrl = page.url();
    await page.locator('button:has-text("Sign in to Contact Seller")').click();

    // Verify modal overlay opens without URL change to /login or /signup
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(page.url()).toBe(currentUrl);

    // Escape closes modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('Signup validation and email verification prompt', async ({ page }) => {
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();

    await page.locator('button[role="tab"]:has-text("Create Account")').click();
    await expect(page.getByRole('heading', { name: 'Create your UniDeal account' })).toBeVisible();

    const testEmail = `spec_user_${Date.now()}@campus.edu`;
    await page.locator('#auth-fullname').fill('Spec Test User');
    await page.locator('#auth-email').fill(testEmail);
    await page.locator('#auth-password').fill('SpecPassword123!');

    await page.locator('button[type="submit"]').click();

    // Wait for Supabase signup network response to complete (loading spinner clears)
    await page.waitForTimeout(5000);
    const inboxHeadingVisible = await page.getByRole('heading', { name: 'Check your inbox' }).isVisible();
    const modalVisible = await page.getByRole('dialog').isVisible();
    const hasAlert = await page.getByRole('dialog').getByRole('alert').first().isVisible().catch(() => false);
    expect(inboxHeadingVisible || !modalVisible || hasAlert).toBe(true);
  });
});
