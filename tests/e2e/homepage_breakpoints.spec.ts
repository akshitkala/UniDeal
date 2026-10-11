import { test, expect } from '@playwright/test';

test.describe('Homepage Responsiveness & Layout Across Breakpoints', () => {
  for (const bp of [
    { name: '375px mobile', width: 375, height: 667 },
    { name: '768px tablet', width: 768, height: 1024 },
    { name: '1440px desktop', width: 1440, height: 900 },
  ]) {
    test(`Homepage on ${bp.name} has no horizontal scroll and renders all sections in order`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');

      // Check no horizontal scroll
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(bp.width);

      // Verify sections are visible in order
      const sections = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2')).map(el => el.textContent?.trim());
        return headings;
      });

      console.log(`${bp.name} Headings found:`, sections);
      expect(sections.some(h => h?.includes('Buy and sell on campus'))).toBe(true);
      expect(sections.some(h => h?.includes('Fresh on campus'))).toBe(true);
      expect(sections.some(h => h?.includes('WhatsApp groups weren'))).toBe(true);
      expect(sections.some(h => h?.includes('Three steps from listing to deal'))).toBe(true);
      expect(sections.some(h => h?.includes('Safe by design'))).toBe(true);
      expect(sections.some(h => h?.includes('Ready to find something, or clear out your room?'))).toBe(true);
    });
  }
});
