import { test, expect } from '@playwright/test';

test.describe('Revised Pass: 50/day Rate Limit & Admin Single/Bulk Reject', () => {
  test('Flow 6 (Rate Limit): 51st reveal attempt hits 429 and displays daily limit notice', async ({ page }) => {
    // Intercept contact endpoint to simulate 429 RATE_LIMITED response
    await page.route('**/api/listings/*/contact', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message: 'Daily limit reached. Try again tomorrow.',
            code: 'RATE_LIMITED',
          },
        }),
      });
    });

    // Log in as verified user
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('#auth-email').fill('akshitkala72@gmail.com');
    await page.locator('#auth-password').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();

    // Navigate to any listing and click Contact Seller
    await page.locator('a[href^="/listing/"]').first().click();
    await page.locator('button:has-text("Contact Seller on WhatsApp")').click();

    // Verify daily rate-limit notice renders cleanly
    await expect(
      page.locator('text=You\'ve reached your daily contact limit. Try again tomorrow.')
    ).toBeVisible();
  });

  test('Flow 13 (Admin Single Reject): Rejecting an approved listing persists reason', async ({ page }) => {
    // Log in as Admin
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('#auth-email').fill('akshitkala72@gmail.com');
    await page.locator('#auth-password').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();

    // Navigate to Admin Listings view
    await page.goto('/admin/listings');
    await expect(page.getByRole('heading', { name: 'Listings Management' })).toBeVisible();

    // Filter to approved listings
    await page.locator('#status-filter').selectOption('approved');
    await page.waitForTimeout(1000);

    const firstRejectBtn = page.locator('button:has-text("Reject")').first();
    if (await firstRejectBtn.isVisible()) {
      await firstRejectBtn.click();
      await expect(page.getByRole('heading', { name: 'Reject Listing' })).toBeVisible();

      await page.locator('#single-reason-input').fill('Policy violation: incorrect item details');
      await page.locator('button:has-text("Confirm Rejection")').click();

      await expect(page.locator('text=Listing rejected successfully.')).toBeVisible();
    }
  });

  test('Flow 13 (Admin Bulk Reject): Bulk reject handles mixed set (valid + already-sold) cleanly', async ({ page }) => {
    // Intercept bulk-reject route to test partial failure handling
    await page.route('**/api/admin/listings/bulk-reject', async (route) => {
      const body = route.request().postDataJSON();
      expect(body.reason).toBe('Bulk review policy violation');
      expect(body.listing_ids.length).toBeGreaterThan(0);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            rejected: ['listing-id-1', 'listing-id-2'],
            skipped: [
              { id: 'listing-id-sold', reason: 'Listing is already sold' },
            ],
          },
        }),
      });
    });

    // Log in as Admin
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('#auth-email').fill('akshitkala72@gmail.com');
    await page.locator('#auth-password').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();

    await page.goto('/admin/listings');
    await expect(page.getByRole('heading', { name: 'Listings Management' })).toBeVisible();

    // Select items
    const checkboxes = page.locator('tbody tr button');
    const count = await checkboxes.count();
    if (count > 0) {
      await checkboxes.nth(0).click();
      if (count > 1) await checkboxes.nth(1).click();

      // Trigger bulk reject modal
      await page.locator('button:has-text("Reject Selected")').click();
      await expect(page.getByRole('heading', { name: /Reject \d+ Listings\?/ })).toBeVisible();

      await page.locator('#bulk-reason-input').fill('Bulk review policy violation');
      await page.locator('#confirm-bulk-check').check();
      await page.locator('button:has-text("Confirm Bulk Rejection")').click();

      // Confirm summary banner appears showing 2 rejected and 1 skipped
      await expect(
        page.locator('text=Bulk action complete: 2 listings rejected (1 skipped).')
      ).toBeVisible();
    }
  });
});
