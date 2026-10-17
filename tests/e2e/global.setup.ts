import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authDir = path.join(__dirname, '../../playwright/.auth');

setup('authenticate as admin', async ({ page }) => {
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const email = process.env.PERF_ADMIN_EMAIL;
  const password = process.env.PERF_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('PERF_ADMIN_EMAIL or PERF_ADMIN_PASSWORD missing. Skipping admin auth setup.');
    return;
  }

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Click Sign In button
  const signInBtn = page.getByRole('button', { name: 'Sign In' }).first();
  await expect(signInBtn).toBeVisible({ timeout: 10000 });
  await signInBtn.click();
  
  const dialog = page.getByRole('dialog');
  // If first click happened before full hydration, retry click
  if (!(await dialog.isVisible())) {
    await signInBtn.click().catch(() => {});
  }
  await expect(dialog).toBeVisible({ timeout: 10000 });
  
  await dialog.locator('#auth-email, input[type="email"]').first().fill(email);
  await dialog.locator('#auth-password, input[type="password"]').first().fill(password);
  await dialog.getByRole('button', { name: 'Sign In' }).click();
  
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  
  await page.context().storageState({ path: path.join(authDir, 'admin.json') });
});

setup('authenticate as student', async ({ page }) => {
  const email = process.env.PERF_USER_EMAIL;
  const password = process.env.PERF_USER_PASSWORD;

  if (!email || !password) {
    console.warn('PERF_USER_EMAIL or PERF_USER_PASSWORD missing. Skipping student auth setup.');
    return;
  }

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const signInBtn = page.getByRole('button', { name: 'Sign In' }).first();
  await expect(signInBtn).toBeVisible({ timeout: 10000 });
  await signInBtn.click();
  
  const dialog = page.getByRole('dialog');
  if (!(await dialog.isVisible())) {
    await signInBtn.click().catch(() => {});
  }
  await expect(dialog).toBeVisible({ timeout: 10000 });

  await dialog.locator('#auth-email, input[type="email"]').first().fill(email);
  await dialog.locator('#auth-password, input[type="password"]').first().fill(password);
  await dialog.getByRole('button', { name: 'Sign In' }).click();
  
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  
  await page.context().storageState({ path: path.join(authDir, 'student.json') });
});
