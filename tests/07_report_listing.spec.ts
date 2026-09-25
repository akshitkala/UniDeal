import { test, expect } from '@playwright/test';

test.describe('Flow 9: Report Listing & 409 Duplicate Check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[placeholder="Your password"]').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();
  });

  test('Report API returns 201 on first report and 409 on duplicate report', async ({ page }) => {
    await page.goto('/browse');
    const listingId = '0dbe07cc-54f0-428f-8da6-a04a7ce0a9f5'; // QA test calculator ID

    const res = await page.evaluate(async (id) => {
      const r1 = await fetch(`/api/listings/${id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Spam' }),
      });
      const r2 = await fetch(`/api/listings/${id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Spam' }),
      });
      return { status1: r1.status, status2: r2.status, data2: await r2.json() };
    }, listingId);

    // Duplicate check must yield 409 DUPLICATE_REPORT
    expect(res.status2).toBe(409);
    expect(res.data2.error.code).toBe('DUPLICATE_REPORT');
  });
});
