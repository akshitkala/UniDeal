import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (A11Y)', () => {
  const routes = ['/', '/browse', '/how-it-works', '/our-story', '/contact'];

  for (const route of routes) {
    test(`A11Y-01: Axe zero serious or critical violations on ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(500);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const seriousOrCritical = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );

      // We expect zero serious or critical violations
      expect(seriousOrCritical).toEqual([]);
    });

    test(`A11Y-04: Exactly one h1 on ${route}`, async ({ page }) => {
      await page.goto(route);
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
    });
  }

  test('META-11: HTML element has lang="en"', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('A11Y-07: Icon-only buttons have accessible name or aria-label', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const text = (await btn.innerText()).trim();
        const ariaLabel = await btn.getAttribute('aria-label');
        const title = await btn.getAttribute('title');
        
        // Button must have either text, aria-label, or title
        expect(Boolean(text || ariaLabel || title)).toBe(true);
      }
    }
  });
});
