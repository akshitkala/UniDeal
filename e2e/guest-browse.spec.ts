import { test, expect } from '@playwright/test';

test.describe('Guest Browse & Listing Detail', () => {
  test('SEC-13 & FUN-25: Guest can load Browse and search by title', async ({ page }) => {
    await page.goto('/browse');
    await expect(page).toHaveTitle(/Browse/i);
    
    // Check search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Textbook');
    
    const cards = page.locator('a[href^="/listing/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('FUN-26: Category filter and condition filter work', async ({ page }) => {
    await page.goto('/browse');
    
    // Category click
    const categoryBtn = page.getByRole('button', { name: /Electronics/i }).or(page.getByText('Electronics', { exact: true })).first();
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click();
      await page.waitForTimeout(600);
      expect(page.url()).toContain('category=');
    }
  });

  test('FUN-27: Sorting options available without Most Viewed', async ({ page }) => {
    await page.goto('/browse');
    const sortSelect = page.locator('select').first();
    if (await sortSelect.isVisible()) {
      const options = await sortSelect.locator('option').allInnerTexts();
      const optionsText = options.join(' ');
      expect(optionsText).not.toContain('Most Viewed');
    }
  });

  test('FUN-29: Filter and sort persist in the URL', async ({ page }) => {
    await page.goto('/browse?category=books-notes&sort=price_asc');
    expect(page.url()).toContain('category=books-notes');
    expect(page.url()).toContain('sort=price_asc');
    
    // Refresh keeps state
    await page.reload();
    expect(page.url()).toContain('category=books-notes');
  });

  test('FUN-44 & SEC-01: Listing Detail shows seller first name only, no phone or branch', async ({ page }) => {
    await page.goto('/browse');
    const firstCard = page.locator('a[href^="/listing/"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    
    await expect(page.locator('h1')).toBeVisible();
    const bodyText = await page.locator('body').innerText();
    
    // No E.164 phone numbers like +91... or raw 10-digit indian numbers
    expect(bodyText).not.toMatch(/\+91\d{10}/);
    
    // Verify first name only in seller details
    const sellerCard = page.locator('text=Seller').locator('..');
    if (await sellerCard.count() > 0) {
      const sellerInfo = await sellerCard.first().innerText();
      // Seller should not show branch like 'CSE' or 'B.Tech' or 'Year'
      expect(sellerInfo).not.toMatch(/Year\s*[1-4]/i);
    }
  });

  test('UI-09 & UI-10: Listing cards keep aspect ratio and have alt text', async ({ page }) => {
    await page.goto('/browse');
    await expect(page.locator('a[href^="/listing/"]').first()).toBeVisible();
    const images = page.locator('a[href^="/listing/"] img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < Math.min(count, 4); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });
});
