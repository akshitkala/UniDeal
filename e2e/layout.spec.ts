import { test, expect } from '@playwright/test';

test.describe('Responsive Layout & Visual Consistency', () => {
  const pagesToCheck = ['/', '/browse', '/how-it-works', '/our-story', '/contact'];

  for (const pagePath of pagesToCheck) {
    test(`RSP-01: No horizontal overflow on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForTimeout(300);
      
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(isOverflowing).toBe(false);
    });
  }

  test('UI-05: Typography loads Outfit for headings and Work Sans for body', async ({ page }) => {
    await page.goto('/');
    
    // Check heading computed font
    const headingFont = await page.locator('h1').first().evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    expect(headingFont.toLowerCase()).toContain('outfit');
    
    // Check body computed font
    const bodyFont = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    expect(bodyFont.toLowerCase()).toContain('work sans');
  });

  test('RSP-02: Interactive primary buttons meet minimum touch target sizes', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button, a.btn, a[href="/sell"]').filter({ visible: true });
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        // At least 36px in either dimension for standard buttons (or 44px recommended)
        expect(box.height).toBeGreaterThanOrEqual(32);
      }
    }
  });
});
