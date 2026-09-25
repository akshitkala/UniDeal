import { test, expect } from '@playwright/test';

test.describe('Flow 10 & 12: Profile & Support Contact Form', () => {
  test('Profile fields editable with explicit Save button and secrecy copy', async ({ page }) => {
    await page.goto('/browse');
    await page.locator('button:has-text("Sign In")').first().click();
    await page.locator('input[placeholder="student@example.com"]').fill('akshitkala72@gmail.com');
    await page.locator('input[placeholder="Your password"]').fill('UniDeal2026!Pass');
    await page.getByRole('dialog').getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Akshit/i })).toBeVisible();

    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: 'Your Profile' })).toBeVisible();
    await expect(page.locator('text=Never shown publicly').first()).toBeVisible();

    await page.locator('input[placeholder="e.g. Computer Science"]').fill('Computer Science');
    await page.locator('button:has-text("Save Changes")').click();
  });

  test('Support Contact Form validates email and submits without auth prompt', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();

    // Invalid email check
    await page.locator('input[placeholder="Your name"]').fill('Support Tester');
    await page.locator('input[placeholder="you@example.com"]').fill('bademail');
    await page.locator('textarea[placeholder="Your message…"]').fill('Testing invalid email');
    await page.locator('button:has-text("Send Message")').click();
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();

    // Valid email submission
    await page.locator('input[placeholder="you@example.com"]').fill('tester@example.com');
    await page.locator('button:has-text("Send Message")').click();
    await expect(page.locator('text=Message sent')).toBeVisible();
  });
});
