import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/admin.json' });

test('Group 2 Debug Failure', async ({ page }) => {
  await page.goto('/admin');
  
  const checkNavigation = async (linkText: string) => {
    const requests: any[] = [];
    const requestHandler = (req: any) => {
      const url = new URL(req.url());
      const headers = req.headers();
      if (url.search.includes('_rsc=') || url.pathname.includes('/admin')) {
        requests.push({
          method: req.method(),
          url: url.pathname + url.search.substring(0, 15),
          prefetch: headers['next-router-prefetch'],
          rsc: headers['rsc'],
          stateTree: headers['next-router-state-tree'],
          initiator: req.frame()?.url() // naive initiator proxy
        });
      }
    };
    page.on('request', requestHandler);
    
    await page.getByRole('link', { name: linkText }).click();
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForLoadState('networkidle');
    
    page.removeListener('request', requestHandler);
    console.log(`[${linkText}] Captured:`, JSON.stringify(requests, null, 2));
  };

  await checkNavigation('Pending Queue');
  await checkNavigation('Reports');
  await checkNavigation('Users');
  await checkNavigation('Pending Queue');
});
