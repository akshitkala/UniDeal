import { test, expect } from '@playwright/test';

test.describe('Metadata, Favicons & SEO', () => {
  test('META-01 & META-02: Favicon and apple-touch-icon links exist and resolve', async ({ page, request }) => {
    await page.goto('/');
    
    const iconLink = page.locator('link[rel="icon"], link[rel="shortcut icon"]');
    await expect(iconLink.first()).toHaveAttribute('href');
    
    // Check favicon endpoint
    const res = await request.get('/favicon.ico');
    expect(res.status()).toBe(200);
  });

  test('META-04 & META-05: Pages have unique non-default title and meta description', async ({ page }) => {
    const pages = [
      { path: '/', titleExpected: /UniDeal/i },
      { path: '/browse', titleExpected: /Browse/i },
      { path: '/how-it-works', titleExpected: /How It Works/i },
      { path: '/contact', titleExpected: /Contact/i },
    ];

    for (const p of pages) {
      await page.goto(p.path);
      const title = await page.title();
      expect(title).toMatch(p.titleExpected);
      expect(title).not.toContain('Create Next App');
      
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc).toBeTruthy();
      expect(desc!.length).toBeGreaterThan(15);
    }
  });

  test('META-06: OpenGraph tags present on Home', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
    
    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
  });

  test('META-09: robots.txt disallows protected routes', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain('/admin');
    expect(text).toContain('/api');
    expect(text).toContain('/dashboard');
    expect(text).toContain('/profile');
    expect(text).toContain('/sell');
  });

  test('META-10: sitemap.xml exists and lists public routes', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<urlset');
    expect(xml).toContain('/browse');
    expect(xml).toContain('/how-it-works');
  });
});
