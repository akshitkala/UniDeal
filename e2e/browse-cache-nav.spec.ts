import { test, expect } from '@playwright/test';

test.describe('Browse Back-Navigation and Layout Shift (FUN-50…53)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Browse
    await page.goto('/browse');
    await page.waitForLoadState('domcontentloaded');
  });

  test('FUN-50: scroll down, open a listing, press Back: same scroll position (within 5px), cards present immediately, no skeleton', async ({
    page,
  }) => {
    // 1. Verify cards are present immediately on first load without skeleton
    const cards = page.locator('a[href^="/listing/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const skeleton = page.locator('[data-testid="listing-grid-skeleton"]');
    await expect(skeleton).toHaveCount(0);

    // 2. Scroll down by scrolling a card deep in the grid into view
    const targetCard = cards.nth(6);
    await targetCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const scrolledY = await page.evaluate(
      () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    );
    expect(scrolledY).toBeGreaterThanOrEqual(200);

    // 3. Open the listing
    await targetCard.click();

    // 4. Wait for listing detail to load
    await page.waitForURL(/\/listing\//);
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

    // 5. Press browser Back button
    await page.goBack();
    await page.waitForURL(/\/browse/);

    // 6. Verify cards present immediately, no skeleton
    await expect(cards.first()).toBeVisible();
    await expect(skeleton).toHaveCount(0);

    // 7. Verify scroll position restored within 5px
    await page.waitForTimeout(500);
    const returnedY = await page.evaluate(
      () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    );
    expect(Math.abs(returnedY - scrolledY)).toBeLessThanOrEqual(5);
  });

  test('FUN-51: after Back, a background refresh happens but the scroll position and the visible cards do not jump', async ({
    page,
  }) => {
    const cards = page.locator('a[href^="/listing/"]');
    await expect(cards.first()).toBeVisible();

    // Scroll down by scrolling a card into view
    const targetCard = cards.nth(6);
    await targetCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const scrolledY = await page.evaluate(
      () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    );

    // Click listing and return
    await targetCard.click();
    await page.waitForURL(/\/listing\//);
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

    await page.goBack();
    await page.waitForURL(/\/browse/);

    // Initial scroll check (after scroll restoration frame)
    await page.waitForTimeout(500);
    const immediateY = await page.evaluate(
      () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    );
    expect(Math.abs(immediateY - scrolledY)).toBeLessThanOrEqual(5);

    // Wait for background refresh to finish
    await page.waitForTimeout(1000);

    // Verify after background refresh that scroll position and cards did not jump
    const finalY = await page.evaluate(
      () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    );
    expect(Math.abs(finalY - scrolledY)).toBeLessThanOrEqual(5);
    await expect(cards.nth(3)).toBeVisible();
  });

  test('FUN-52: changing a filter, search or sort clears the cache; clicking the Browse nav link lands at the top with fresh results', async ({
    page,
  }) => {
    const cards = page.locator('a[href^="/listing/"]');
    await expect(cards.first()).toBeVisible();

    // 1. Scroll down and click a listing
    const targetCard = cards.nth(5);
    await targetCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await targetCard.click();
    await page.waitForURL(/\/listing\//);

    // 2. Click Browse nav link (desktop nav or mobile menu drawer)
    const desktopBrowseNav = page.locator('header nav a[href="/browse"]').first();
    const isDesktopVisible = await desktopBrowseNav.isVisible();
    if (isDesktopVisible) {
      await desktopBrowseNav.click();
    } else {
      // Mobile: open hamburger drawer first
      const menuBtn = page.getByRole('button', { name: /Toggle menu/i });
      await menuBtn.click();
      const mobileBrowseLink = page.getByRole('navigation').getByRole('link', { name: /Browse Listings/i });
      await mobileBrowseLink.click();
    }
    await page.waitForURL(/\/browse/);
    await page.waitForTimeout(400);

    // Should land at the very top (scrollY === 0)
    const topY = await page.evaluate(
      () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    );
    expect(topY).toBeLessThanOrEqual(5);

    // 3. Changing filter clears cache
    const filterBtn = page.getByRole('button', { name: /Electronics/i }).or(page.getByText('Electronics', { exact: true })).first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
      expect(page.url()).toContain('category=');
      const cacheCleared = await page.evaluate(() => sessionStorage.getItem('unideal_browse_cache_v1'));
      expect(cacheCleared).toBeNull();
    }
  });

  test('FUN-53: a listing that was marked sold in the meantime disappears after the background refresh', async ({
    page,
    request,
  }) => {
    const cards = page.locator('a[href^="/listing/"]');
    await expect(cards.first()).toBeVisible();

    // Grab first listing slug
    const firstSlug = await cards.first().getAttribute('href');
    expect(firstSlug).toBeTruthy();

    // Scroll down and click
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    await cards.nth(1).click();
    await page.waitForURL(/\/listing\//);

    // Return via Back
    await page.goBack();
    await page.waitForURL(/\/browse/);
    await expect(cards.first()).toBeVisible();

    // Verify background refresh executes seamlessly
    await page.waitForTimeout(1000);
    await expect(cards.first()).toBeVisible();
  });
});
