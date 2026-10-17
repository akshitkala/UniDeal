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

  test('Google OAuth button appears on login and signup tabs and triggers OAuth redirect', async ({ page }) => {
    await page.goto('/');
    const signInBtn = page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first();
    await signInBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify Google button on Sign In tab
    const googleBtn = dialog.locator('#google-signin-btn');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Continue with Google');
    // Verify inline SVG icon is present inside button
    await expect(googleBtn.locator('svg')).toBeVisible();

    // Switch to Create account (signup) tab
    await dialog.locator('#auth-tab-signup').click();
    await expect(googleBtn).toBeVisible();

    // Switch to Forgot password
    await dialog.locator('#auth-tab-login').click();
    await dialog.locator('#forgot-password-link').click();
    // Google button should NOT be present on forgot password
    await expect(googleBtn).not.toBeVisible();

    // Return to Sign In
    await dialog.getByRole('button', { name: /Back to Sign in/i }).click();
    await expect(googleBtn).toBeVisible();

    // Intercept OAuth navigation/call
    let oauthInitiated = false;
    await page.route('**/auth/v1/authorize?provider=google*', (route) => {
      oauthInitiated = true;
      route.abort(); // Prevent actual redirection to Google
    });

    await googleBtn.click();
    // Verify it attempted to connect with Google OAuth
    await expect.poll(() => oauthInitiated).toBe(true);
  });

  test('Sign In Flow: Validations and password toggle', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 1. Submit empty form
    const submitBtn = dialog.locator('button[type="submit"]');
    await submitBtn.click();
    await expect(dialog.locator('#auth-email-error')).toHaveText('Email is required');
    await expect(dialog.locator('#auth-password-error')).toHaveText('Password is required');

    // 2. Submit invalid email format
    const emailInput = dialog.locator('#auth-email');
    await emailInput.fill('invalid-email-format');
    await submitBtn.click();
    await expect(dialog.locator('#auth-email-error')).toHaveText('Please enter a valid email address');

    // 3. Password visibility toggle
    const passwordInput = dialog.locator('#auth-password');
    await passwordInput.fill('mySecret123');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    const togglePasswordBtn = dialog.locator('button[aria-label="Show password"]');
    await togglePasswordBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    const hidePasswordBtn = dialog.locator('button[aria-label="Hide password"]');
    await hidePasswordBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Sign Up Flow: Fields, validations, terms links, and duplicate email error', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Switch to Create account tab
    await dialog.locator('#auth-tab-signup').click();
    await expect(dialog.locator('#auth-modal-title')).toHaveText('Create an account');

    const nameInput = dialog.locator('#auth-fullname');
    const emailInput = dialog.locator('#auth-email');
    const passwordInput = dialog.locator('#auth-password');
    const submitBtn = dialog.locator('button[type="submit"]');

    await expect(nameInput).toBeVisible();
    await expect(dialog.locator('#auth-fullname-helper')).toHaveText('Only your first name is shown on listings.');

    // 1. Submit empty form
    await submitBtn.click();
    await expect(dialog.locator('#auth-fullname-error')).toHaveText('Full name is required');
    await expect(dialog.locator('#auth-email-error')).toHaveText('Email is required');
    await expect(dialog.locator('#auth-password-error')).toHaveText('Password is required');

    // 2. Short name (<2 chars)
    await nameInput.fill('A');
    await submitBtn.click();
    await expect(dialog.locator('#auth-fullname-error')).toHaveText('Full name must be at least 2 characters');

    // 3. Short password (<6 chars)
    await nameInput.fill('Akshit Tester');
    await emailInput.fill('akshitkala72@gmail.com');
    await passwordInput.fill('12345');
    await submitBtn.click();
    await expect(dialog.locator('#auth-password-error')).toHaveText('Password must be at least 6 characters');

    // 4. Verify terms and privacy links
    const termsLink = dialog.locator('a[href="/terms"]');
    await expect(termsLink).toHaveAttribute('target', '_blank');
    await expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');

    const privacyLink = dialog.locator('a[href="/privacy"]');
    await expect(privacyLink).toHaveAttribute('target', '_blank');
    await expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');

    // 5. Submit with already registered email
    await passwordInput.fill('ValidPassword123!');
    await submitBtn.click();

    // Verify friendly duplicate account error banner
    await expect(dialog.locator('[role="alert"]')).toContainText(
      'An account with this email address already exists. Please sign in.'
    );
  });

  test('Forgot Password Flow: Tab transition, validation, submit, and confirmation screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Sign In' }).filter({ visible: true }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Click Forgot password link
    const forgotLink = dialog.locator('#forgot-password-link');
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    // Verify header and fields state
    await expect(dialog.locator('#auth-modal-title')).toHaveText('Reset password');
    await expect(dialog.locator('text=Enter your email and we\'ll send you a link to reset your password.')).toBeVisible();
    await expect(dialog.locator('#auth-fullname')).not.toBeVisible();
    await expect(dialog.locator('#auth-password')).not.toBeVisible();
    await expect(dialog.locator('#google-signin-btn')).not.toBeVisible();

    const emailInput = dialog.locator('#auth-email');
    const submitBtn = dialog.locator('button[type="submit"]');
    await expect(submitBtn).toHaveText('Send reset link');

    // 1. Submit empty email
    await submitBtn.click();
    await expect(dialog.locator('#auth-email-error')).toHaveText('Email is required');

    // 2. Submit invalid email
    await emailInput.fill('not-an-email');
    await submitBtn.click();
    await expect(dialog.locator('#auth-email-error')).toHaveText('Please enter a valid email address');

    // 3. Mock reset password response or test valid submission
    await emailInput.fill('student.reset@example.com');
    await submitBtn.click();

    // Verify confirmation view renders
    await expect(dialog.locator('#auth-modal-title')).toHaveText('Check your inbox');
    await expect(dialog.locator('text=student.reset@example.com')).toBeVisible();
    await expect(dialog.locator('text=We\'ve sent a password reset link to')).toBeVisible();

    // Click "Back to Sign in"
    const backBtn = dialog.getByRole('button', { name: 'Back to Sign in' });
    await backBtn.click();

    // Should return to Sign in tab
    await expect(dialog.locator('#auth-modal-title')).toHaveText('Welcome back');
    await expect(dialog.locator('#auth-password')).toBeVisible();
    await expect(dialog.locator('#google-signin-btn')).toBeVisible();
  });
});
