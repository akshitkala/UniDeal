import { test, expect } from '@playwright/test';

test.describe('Flow 6: Contact Seller Trust Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[placeholder="Your password"]').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();
  });

  test('Contact seller opens WhatsApp link and hides raw phone number', async ({ page }) => {
    await page.goto('/listing/physics-lab-manual-theory-notes-N4ida');

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/listings/') && res.url().includes('/contact')),
      page.locator('button:has-text("Contact Seller on WhatsApp")').click()
    ]);

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.data.waLink).toContain('https://wa.me/');
    expect(json.data.whatsapp_number).toBeUndefined();
  });

  test('Seller with no contact number handles 404 cleanly', async ({ page }) => {
    await page.route('**/api/listings/*/contact', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Seller contact not available.', code: 'NO_CONTACT' } }),
      });
    });

    await page.goto('/browse');
    await page.locator('a[href^="/listing/"]').first().click();
    await page.locator('button:has-text("Contact Seller on WhatsApp")').click();

    await expect(page.locator('text=Seller contact not available.')).toBeVisible();
  });
});
