import { test, expect } from '@playwright/test';

test.describe('Auth Modal Flows', () => {
  test('FUN-01 & A11Y-03: Modal opens via Sell and Sign In when logged out, has role=dialog and aria-modal', async ({ page }) => {
    await page.goto('/');
    
    // Click Sign In
    const signInBtn = page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first();
    await signInBtn.click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    
    // Close via escape
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    
    // Click Sell Item (use visible element across desktop & mobile)
    const sellBtn = page.locator('a[href="/sell"]:visible').first();
    if (await sellBtn.isVisible()) {
      await sellBtn.click();
    } else {
      await page.getByRole('button', { name: 'Toggle menu' }).click();
      await page.locator('a[href="/sell"]').first().click();
    }
    await expect(dialog).toBeVisible();
    
    // Close button
    const closeBtn = dialog.getByRole('button', { name: /Close/i });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(dialog).not.toBeVisible();
    }
  });

  test('FUN-03: Backdrop click closes the modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first().click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Click outside dialog overlay (e.g. top left corner 10, 10)
    await page.mouse.click(10, 10);
    await expect(dialog).not.toBeVisible();
  });

  test('FUN-04: Browser back closes the modal and stays on the underlying page', async ({ page }) => {
    await page.goto('/browse');
    await page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first().click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Back button in browser
    await page.goBack();
    await expect(dialog).not.toBeVisible();
    expect(page.url()).toContain('/browse');
  });

  test('FUN-06: Wrong password shows inline error, modal stays open', async ({ page }) => {
    await page.goto('/browse');
    await page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first().click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    await dialog.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await dialog.locator('input[placeholder="••••••••"], input[type="password"]').fill('WrongPassword999!');
    await dialog.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(dialog.locator('text=/Invalid login credentials|Invalid email or password/i')).toBeVisible();
    await expect(dialog).toBeVisible();
  });

  test('FUN-07: /login and /signup return 404', async ({ request }) => {
    const resLogin = await request.get('/login');
    expect(resLogin.status()).toBe(404);
    
    const resSignup = await request.get('/signup');
    expect(resSignup.status()).toBe(404);
  });
});
