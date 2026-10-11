import { test, expect } from '@playwright/test';

test.describe('Homepage 1440x900 viewport visibility test', () => {
  test('Hero, stats, and top of first listing row are visible without scrolling at 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    const stats = page.locator('text=Always free');
    await expect(stats).toBeVisible();

    const firstCard = page.locator('a[href^="/listing/"]').first();
    await expect(firstCard).toBeVisible();

    // Verify top of first listing row is visible in viewport without scrolling (< 900)
    const cardBox = await firstCard.boundingBox();
    expect(cardBox).not.toBeNull();
    console.log(`Card box at 1440x900: y = ${cardBox?.y}, height = ${cardBox?.height}`);
    expect(cardBox!.y).toBeLessThan(900);
  });
});
