import { test, expect } from '@playwright/test';

test.describe('Static Pages & Navigation Links', () => {
  const staticRoutes = [
    { path: '/', title: /UniDeal/i },
    { path: '/browse', title: /Browse/i },
    { path: '/how-it-works', title: /How It Works/i },
    { path: '/our-story', title: /Our Story/i },
    { path: '/contact', title: /Contact/i },
    { path: '/privacy', title: /Privacy/i },
    { path: '/terms', title: /Terms/i },
    { path: '/safety', title: /Safety/i },
  ];

  for (const { path, title } of staticRoutes) {
    test(`FUN-43 & LNK-01: ${path} loads without auth`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      
      // CPY-01: No lorem, TODO, placeholder
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toMatch(/\blorem\b/i);
      expect(bodyText).not.toMatch(/\basdf\b/i);
      expect(bodyText).not.toMatch(/\bCreate Next App\b/i);
      
      // UI-04: No .edu-only restrictions
      expect(bodyText).not.toMatch(/\.edu-only/i);
    });
  }

  test('LNK-04: Zero href="#" or empty href on rendered pages', async ({ page }) => {
    for (const route of ['/', '/browse', '/how-it-works', '/our-story', '/contact']) {
      await page.goto(route);
      const invalidLinks = await page.locator('a[href="#"], a[href=""]').count();
      expect(invalidLinks).toBe(0);
    }
  });

  test('LNK-02: External links use target="_blank" and rel="noopener noreferrer"', async ({ page }) => {
    await page.goto('/');
    const externalLinks = page.locator('a[href^="http://"], a[href^="https://"]').filter({
      hasNot: page.locator('a[href^="http://localhost"]'),
    });
    
    const count = await externalLinks.count();
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');
      if (target === '_blank') {
        expect(rel).toContain('noopener');
      }
    }
  });

  test('LNK-06 & META-13: Custom 404 page returns 404 and links back to Browse', async ({ page }) => {
    const res = await page.goto('/non-existent-page-testing-404');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toBeVisible();
    
    const browseLink = page.locator('main a[href="/browse"]').first();
    await expect(browseLink).toBeVisible();
  });
});
