import { test, expect } from '@playwright/test';

test.describe('Report Listing Flow (FUN-36)', () => {
  test('FUN-36: Real button clicks, submits report, checks duplicate message, listing stays live', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // 1. Sign in via Auth Modal
    await page.goto('/browse');
    await page.waitForLoadState('networkidle');

    // Find visible Sign In button across desktop and mobile
    const signInDesktop = page.getByRole('button', { name: 'Sign In' }).filter({ visible: true });
    if (await signInDesktop.count() > 0) {
      await signInDesktop.first().click();
    } else {
      const toggleMenu = page.getByRole('button', { name: 'Toggle menu' });
      if (await toggleMenu.isVisible()) {
        await toggleMenu.click();
        await page.waitForTimeout(300);
        await page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first().click();
      }
    }

    const authDialog = page.getByRole('dialog');
    await expect(authDialog).toBeVisible({ timeout: 10000 });

    await authDialog.locator('input#auth-email, input[type="email"]').first().fill('qa_verify_user@campus.edu');
    await authDialog.locator('input#auth-password, input[type="password"]').first().fill('QaVerify123!');
    await authDialog.locator('button[type="submit"]').click();
    await expect(authDialog).not.toBeVisible({ timeout: 10000 });

    // 2. Open listing detail page of another seller
    await page.goto('/listing/boat-rockerz-450-bluetooth-headphones-eXFpD');
    await page.waitForLoadState('domcontentloaded');

    // 3. Verify Report button is visible below the fold
    const reportBtn = page.locator('#report-listing-button');
    await expect(reportBtn).toBeVisible({ timeout: 10000 });

    // 4. Click Report button to open report modal
    await reportBtn.click();

    const reportModal = page.getByRole('dialog');
    await expect(reportModal).toBeVisible();
    await expect(reportModal.getByText('Report this listing')).toBeVisible();

    // 5. Select reason and submit
    const reasonSelect = reportModal.locator('select#report-reason');
    const submitBtn = reportModal.locator('#submit-report-button');

    if (await reasonSelect.isVisible()) {
      await reasonSelect.selectOption('Spam');
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
    }

    // 6. Expect either success or duplicate feedback message
    await expect(
      reportModal.locator('text=/Thanks, we\'ll review this\\.|You\'ve already reported this listing\\./i')
    ).toBeVisible({ timeout: 10000 });

    // 7. Close modal
    const closeBtn = reportModal.locator('button[aria-label="Close"], #close-report-modal').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(reportModal).not.toBeVisible({ timeout: 5000 });

    // 8. Re-open and submit again to verify duplicate handling
    await reportBtn.click();
    await expect(reportModal).toBeVisible();

    if (await reasonSelect.isVisible()) {
      await reasonSelect.selectOption('Other');
      await expect(submitBtn).toBeEnabled();
      await submitBtn.click();
    }

    // Must show duplicate message: "You've already reported this listing."
    await expect(
      reportModal.locator('text=/You\'ve already reported this listing\\./i')
    ).toBeVisible({ timeout: 10000 });

    // 9. Confirm listing stays live — heading and Contact Seller button remain intact
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/boAt Rockerz/i);
    await expect(page.locator('#contact-seller-btn, #contact-seller-login')).toBeVisible();
  });
});
