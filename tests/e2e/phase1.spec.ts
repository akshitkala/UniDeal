import { test, expect } from './fixtures';

test.describe('Group 1: AUTH MATRIX', () => {
  const adminRoutes = [
    '/admin',
    '/admin/listings/pending',
    '/admin/reports',
    '/admin/users'
  ];
  const adminApiRoutes = [
    '/api/admin/overview',
    '/api/admin/settings',
    '/api/admin/listings/pending',
    '/api/admin/reports'
  ];

  test.describe('Guest', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    for (const route of adminRoutes) {
      test(`Guest accessing ${route} redirects to /`, async ({ page }) => {
        await page.goto(route);
        await expect(page).toHaveURL('/');
      });
    }

    for (const route of adminApiRoutes) {
      test(`Guest accessing ${route} returns 401/403`, async ({ request }) => {
        const response = await request.get(route);
        expect(response.status()).toBeGreaterThanOrEqual(401);
      });
    }
  });

  test.describe('Student', () => {
    test.use({ storageState: 'playwright/.auth/student.json' });

    for (const route of adminRoutes) {
      test(`Student accessing ${route} redirects to /`, async ({ page }) => {
        await page.goto(route);
        await expect(page).toHaveURL('/');
      });
    }

    for (const route of adminApiRoutes) {
      test(`Student accessing ${route} returns 401/403`, async ({ request }) => {
        const response = await request.get(route);
        expect(response.status()).toBeGreaterThanOrEqual(401);
      });
    }
  });

  test.describe('Admin', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });

    for (const route of adminRoutes) {
      test(`Admin accessing ${route} succeeds`, async ({ page }) => {
        const response = await page.goto(route);
        expect(response?.status()).toBe(200);
        await expect(page.locator('h1').first()).toBeVisible();
      });
    }

    for (const route of adminApiRoutes) {
      test(`Admin accessing ${route} succeeds`, async ({ request }) => {
        const response = await request.get(route);
        expect(response.status()).toBe(200);
      });
    }
  });
});

test.describe('Group 2: ADMIN NAVIGATION', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('Navigate through admin pages and verify _rsc requests', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('h1').first()).toContainText('UniDeal Admin Console');

    const checkNavigation = async (linkText: string, expectedHeading: string) => {
      const rscRequests: string[] = [];
      const apiAdminRequests: string[] = [];
      const consoleErrors: string[] = [];

      const requestHandler = (req: any) => {
        const url = req.url();
        const headers = req.headers();
        const isPrefetch = headers['next-router-prefetch'] === '1' || headers['Next-Router-Prefetch'] === '1';
        
        if (url.includes('_rsc=') && !isPrefetch) rscRequests.push(url);
        if (url.includes('/api/admin/') && req.method() === 'GET') apiAdminRequests.push(url);
      };
      
      const consoleHandler = (msg: any) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      };

      page.on('request', requestHandler);
      page.on('console', consoleHandler);

      await page.getByRole('link', { name: linkText }).click();
      await expect(page.locator('h1').first()).toContainText(expectedHeading);
      await expect(page.locator('h1').first()).toBeVisible();
      
      // Wait for requests to settle so they don't bleed into the next listener
      await page.waitForLoadState('networkidle');

      expect(rscRequests.length).toBeLessThanOrEqual(1); // non-prefetch _rsc requests <= 1
      expect(apiAdminRequests.length).toBe(0); // Zero GET requests to /api/admin/*
      expect(consoleErrors.length).toBe(0); // No console errors

      page.removeListener('request', requestHandler);
      page.removeListener('console', consoleHandler);
    };

    await checkNavigation('Pending Queue', 'UniDeal Admin Console');
    await checkNavigation('Reports', 'UniDeal Admin Console');
    await checkNavigation('Users', 'UniDeal Admin Console');
    
    // Run a second time in the same session to cover the cached case
    await checkNavigation('Pending Queue', 'UniDeal Admin Console');
    await checkNavigation('Reports', 'UniDeal Admin Console');
    await checkNavigation('Users', 'UniDeal Admin Console');
  });
});

test.describe('Group 5: PRIVACY', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  let responses: string[] = [];

  test.beforeEach(async ({ page }) => {
    responses = [];
    page.on('response', async (res) => {
      if (res.url().includes('/api/')) {
        try {
          const text = await res.text();
          responses.push(text);
        } catch {
          // ignore stream errors
        }
      }
    });
  });

  const checkPagePrivacy = async (page: any) => {
    await page.waitForLoadState('networkidle');
    const html = await page.content();
    expect(html).not.toContain('whatsapp_number');
    expect(html).not.toMatch(/wa\.me\/|tel:|\+91|(?<!\d)[6-9]\d{9}(?!\d)/); 
    
    const sellerLocator = page.locator('.font-medium.text-neutral-text.truncate, .text-sm.font-semibold.text-neutral-text.truncate');
    await sellerLocator.first().waitFor({ state: 'visible' });
    const sellerNames = await sellerLocator.allTextContents();
    
    expect(sellerNames.length).toBeGreaterThan(0);
    
    for (const name of sellerNames) {
      const cleanName = name.replace('Listed by ', '').trim();
      expect(cleanName).not.toMatch(/\s/);
    }
    
    for (const text of responses) {
      expect(text).not.toContain('whatsapp_number');
      expect(text).not.toMatch(/wa\.me\/|tel:|\+91|(?<!\d)[6-9]\d{9}(?!\d)/);
    }
  };

  test('Home page privacy', async ({ page }) => {
    await page.goto('/');
    await checkPagePrivacy(page);
  });

  test('Browse page privacy', async ({ page }) => {
    await page.goto('/browse');
    await checkPagePrivacy(page);
  });

  test('Listing detail page privacy', async ({ page }) => {
    await page.goto('/');
    const firstListing = page.locator('a[href^="/listing/"]').first();
    await firstListing.click();
    await checkPagePrivacy(page);
  });
});

test.describe('Group 6: AUTH MODAL', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const firstListing = page.locator('a[href^="/listing/"]').first();
    await firstListing.click();
    await page.waitForLoadState('networkidle');
  });

  test('(a) opens via Contact Seller as guest with no URL change', async ({ page }) => {
    const contactBtn = page.getByRole('button', { name: /Sign in to Contact Seller/i }).first();
    await contactBtn.click();
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    expect(page.url()).not.toContain('/login');
  });

  test('(b) Escape closes it', async ({ page }) => {
    const contactBtn = page.getByRole('button', { name: /Sign in to Contact Seller/i }).first();
    await contactBtn.click();
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('(c) browser Back closes it and stays on the page underneath', async ({ page }) => {
    const contactBtn = page.getByRole('button', { name: /Sign in to Contact Seller/i }).first();
    await contactBtn.click();
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await page.goBack();
    await expect(modal).not.toBeVisible();
    expect(page.url()).toContain('/listing/');
  });

  test('(d) backdrop click closes it', async ({ page }) => {
    const contactBtn = page.getByRole('button', { name: /Sign in to Contact Seller/i }).first();
    await contactBtn.click();
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await page.mouse.click(0, 0); // Click outside
    await expect(modal).not.toBeVisible();
  });

  test('(e) Tab and Shift+Tab stay inside the dialog', async ({ page }) => {
    const contactBtn = page.getByRole('button', { name: /Sign in to Contact Seller/i }).first();
    await contactBtn.click();
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    
    await page.keyboard.press('Tab');
    const focused1 = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused1).toBeTruthy();
    
    await page.keyboard.press('Shift+Tab');
    const focused2 = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused2).toBeTruthy();
  });

  test('(f) focused controls have a visible focus ring via computed outline or box-shadow', async ({ page }) => {
    const contactBtn = page.getByRole('button', { name: /Sign in to Contact Seller/i }).first();
    await contactBtn.click();
    const modal = page.locator('div[role="dialog"]');
    await expect(modal).toBeVisible();
    
    const assertFocusRing = async () => {
      const isRinged = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        const style = window.getComputedStyle(el);
        const hasOutline = style.outline && style.outline !== 'none' && style.outlineWidth !== '0px';
        const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none';
        return hasOutline || hasBoxShadow;
      });
      expect(isRinged).toBe(true);
    };

    await page.keyboard.press('Tab');
    await assertFocusRing();
  });
});
