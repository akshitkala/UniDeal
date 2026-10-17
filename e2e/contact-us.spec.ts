import { test, expect } from '@playwright/test';

test.describe('Support Contact Form Flow', () => {
  test('FUN-42 & SEC-18: Contact form validates fields and handles success state', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveTitle(/Contact Us/i);
    
    // Submit empty to check validation
    const submitBtn = page.getByRole('button', { name: /Send Message/i }).first();
    await submitBtn.click();
    
    // Look for error or required state
    const nameInput = page.locator('input[id="contact-name"], input[name="name"]').first();
    await expect(nameInput).toBeVisible();
    
    // Fill invalid email
    await nameInput.fill('Tester Student');
    const emailInput = page.locator('input[id="contact-email"], input[name="email"]').first();
    await emailInput.fill('invalid-email-address');
    const messageInput = page.locator('textarea[id="contact-message"], textarea[name="message"]').first();
    await messageInput.fill('Test support inquiry');
    await submitBtn.click();
    
    // Expect error for invalid email
    await expect(page.locator('text=/valid email/i')).toBeVisible();
    
    // Fill valid email and mock successful API response
    await emailInput.fill('tester@campus.edu');
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Message sent successfully.' }),
      });
    });
    
    await submitBtn.click();
    await expect(page.locator('text=/Message sent|Thank you/i')).toBeVisible();
  });

  test('FUN-42 & SEC-18: Mocked Resend failure returns standard error and never leaks stack trace', async ({ page }) => {
    await page.goto('/contact');
    
    // Mock failure on /api/contact
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Unable to send message. Please try again later.',
          },
        }),
      });
    });
    
    await page.locator('input[id="contact-name"], input[name="name"]').first().fill('Tester');
    await page.locator('input[id="contact-email"], input[name="email"]').first().fill('tester@campus.edu');
    await page.locator('textarea[id="contact-message"], textarea[name="message"]').first().fill('Test inquiry with simulated error');
    
    const submitBtn = page.getByRole('button', { name: /Send Message/i }).first();
    await submitBtn.click();
    
    // Check error banner
    const errorEl = page.locator('text=/Couldn\'t send your message|Please try again/i');
    await expect(errorEl).toBeVisible();
    
    // Ensure no Resend internal API keys or stack trace text are visible
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('re_');
    expect(bodyText).not.toContain('node_modules');
    expect(bodyText).not.toContain('ResendError');
  });
});
