import { test, expect } from '@playwright/test';

test.describe('Flow 1: Guest / Public Browsing', () => {
  test('Homepage loads hero, sample listings, and nav links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/UniDeal/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Buy and sell on campus/i);

    // Nav links
    await expect(page.getByRole('link', { name: 'Browse', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'How It Works' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Our Story' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact Us' }).first()).toBeVisible();

    // Sample listings grid
    const listings = page.locator('a[href^="/listing/"]');
    expect(await listings.count()).toBeGreaterThan(0);
  });

  test('Browse loads full grid and sorting/filters work', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.getByRole('heading', { name: 'Campus Marketplace' })).toBeVisible();

    // Sort price low to high
    await page.locator('select').selectOption('price_asc');
    await expect(page).toHaveURL(/sort=price_asc/);

    // Filter by search keyword
    await page.locator('input[type="text"]').fill('Calculator');
    await expect(page).toHaveURL(/search=Calculator/);

    // Clear filters empty state check
    await page.locator('input[type="text"]').fill('nonexistentxyz123456');
    await expect(page.getByRole('heading', { name: 'No listings match these filters' })).toBeVisible();
  });

  test('Listing Detail shows seller first name only when logged out', async ({ page }) => {
    await page.goto('/browse');
    await page.locator('a[href^="/listing/"]').first().click();

    await expect(page.locator('text=Listed by')).toBeVisible();
    await expect(page.locator('text=Verified Student Seller')).toBeVisible();
    // Confirm full name/branch/year not shown in trust box
    await expect(page.locator('text=Computer Science')).not.toBeVisible();
  });

  test('Static pages load without auth gate', async ({ page }) => {
    await page.goto('/our-story');
    await expect(page).toHaveTitle(/Our Story/);

    await page.goto('/how-it-works');
    await expect(page).toHaveTitle(/How It Works/);
  });
});
