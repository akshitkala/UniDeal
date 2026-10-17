import { test, expect } from '@playwright/test';

test.describe('VISUAL: Core Surface Baselines', () => {
  test('Home Page Visual Snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.05 });
  });

  test('Browse Page Visual Snapshot', async ({ page }) => {
    await page.goto('/browse');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('browse-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.05 });
  });

  test('Listing Detail Visual Snapshot', async ({ page }) => {
    await page.goto('/listing/engineering-mathematics-textbook-eAJiY');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('listing-detail-baseline.png', { fullPage: true, maxDiffPixelRatio: 0.05 });
  });

  test('Auth Modal Visual Snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const signInBtn = page.locator('button:has-text("Sign In")').first();
    const sellBtn = page.locator('button:has-text("Sell"), a:has-text("Sell")').first();
    const menuBtn = page.locator('button[aria-label="Toggle navigation menu"], button[aria-label*="menu" i]').first();

    if (await signInBtn.isVisible()) {
      await signInBtn.click();
    } else if (await sellBtn.isVisible()) {
      await sellBtn.click();
    } else if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
      const mobileSignIn = page.locator('button:has-text("Sign In")').first();
      if (await mobileSignIn.isVisible()) {
        await mobileSignIn.click();
      }
    } else {
      await page.goto('/sell');
    }

    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(page).toHaveScreenshot('auth-modal-baseline.png', { maxDiffPixelRatio: 0.05 });
  });
});
