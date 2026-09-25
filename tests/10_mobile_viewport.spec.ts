import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 667 } });

test.describe('Flow 14: Mobile Viewport Responsiveness', () => {
  test('Browse page on 375px mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.goto('/browse');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('Listing Detail page on 375px mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.goto('/listing/physics-lab-manual-theory-notes-N4ida');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('Sell page on 375px mobile viewport has no horizontal overflow', async ({ page }) => {
    await page.goto('/sell');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
});
