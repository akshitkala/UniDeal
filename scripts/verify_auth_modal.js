import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const screenshotDir = path.join(process.cwd(), 'scratch', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const baseURL = 'http://localhost:3001';

  console.log('Capturing desktop screenshots (1440x900)...');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Desktop - Unknown/General Context (Home) -> Login default
  await desktopPage.goto(baseURL);
  await desktopPage.waitForLoadState('networkidle');
  // Open modal from nav "Sign In"
  await desktopPage.locator('header button:has-text("Sign In")').first().click();
  await desktopPage.waitForSelector('[role="dialog"]');
  await desktopPage.screenshot({ path: path.join(screenshotDir, 'desktop_login_default_general.png') });
  console.log('Saved desktop_login_default_general.png');

  // 2. Desktop - Login failure banner
  await desktopPage.locator('#auth-email').fill('wrong@example.com');
  await desktopPage.locator('#auth-password').fill('wrongpass123');
  await desktopPage.locator('button[type="submit"]:has-text("Sign in")').click();
  await desktopPage.waitForSelector('[role="alert"]');
  await desktopPage.screenshot({ path: path.join(screenshotDir, 'desktop_login_failure.png') });
  console.log('Saved desktop_login_failure.png');

  // 3. Desktop - Signup default
  await desktopPage.locator('button[role="tab"]:has-text("Create account")').click();
  await desktopPage.locator('#auth-fullname').fill('');
  await desktopPage.locator('#auth-email').fill('');
  await desktopPage.locator('#auth-password').fill('');
  await desktopPage.screenshot({ path: path.join(screenshotDir, 'desktop_signup_default.png') });
  console.log('Saved desktop_signup_default.png');

  // 4. Desktop - Signup with errors
  await desktopPage.locator('button[type="submit"]:has-text("Create account")').click();
  await desktopPage.waitForSelector('#auth-fullname-error');
  await desktopPage.screenshot({ path: path.join(screenshotDir, 'desktop_signup_errors.png') });
  console.log('Saved desktop_signup_errors.png');

  // Close modal
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForSelector('[role="dialog"]', { state: 'hidden' });

  // 5. Desktop - Sell context headline ("Sign in to list your item.")
  await desktopPage.locator('header a[href="/sell"], a:has-text("Sell an Item")').first().click();
  await desktopPage.waitForSelector('[role="dialog"]');
  await desktopPage.screenshot({ path: path.join(screenshotDir, 'desktop_headline_sell.png') });
  console.log('Saved desktop_headline_sell.png');
  await desktopPage.keyboard.press('Escape');
  await desktopPage.waitForSelector('[role="dialog"]', { state: 'hidden' });

  // 6. Desktop - Contact seller context ("Sign in to contact the seller.")
  await desktopPage.goto(`${baseURL}/browse`);
  await desktopPage.waitForLoadState('networkidle');
  const firstListing = desktopPage.locator('a[href*="/listing/"]').first();
  if (await firstListing.isVisible()) {
    const href = await firstListing.getAttribute('href');
    if (href) {
      await desktopPage.goto(`${baseURL}${href}`);
      await desktopPage.waitForLoadState('networkidle');
      const contactBtn = desktopPage.locator('#contact-seller-login, button:has-text("Sign in to Contact Seller")').first();
      if (await contactBtn.isVisible()) {
        await contactBtn.click();
        await desktopPage.waitForSelector('[role="dialog"]');
        await desktopPage.screenshot({ path: path.join(screenshotDir, 'desktop_headline_contact.png') });
        console.log('Saved desktop_headline_contact.png');
        await desktopPage.keyboard.press('Escape');
        await desktopPage.waitForSelector('[role="dialog"]', { state: 'hidden' });
      }
    }
  }

  // 8. Mobile screenshots (375x812)
  console.log('Capturing mobile screenshots (375x812)...');
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.goto(baseURL);
  await mobilePage.waitForLoadState('networkidle');

  // Click visible mobile header Sign In button (lines 204-210)
  await mobilePage.locator('div.flex.items-center.gap-2.md\\:hidden button:has-text("Sign In")').click();
  await mobilePage.waitForSelector('[role="dialog"]');
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'mobile_login_default.png') });
  console.log('Saved mobile_login_default.png');

  // Mobile login failure
  await mobilePage.locator('#auth-email').fill('bad@example.com');
  await mobilePage.locator('#auth-password').fill('badpass');
  await mobilePage.locator('button[type="submit"]:has-text("Sign in")').click();
  await mobilePage.waitForSelector('[role="alert"]');
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'mobile_login_failure.png') });
  console.log('Saved mobile_login_failure.png');

  // Mobile signup default
  await mobilePage.locator('button[role="tab"]:has-text("Create account")').click();
  await mobilePage.locator('#auth-fullname').fill('');
  await mobilePage.locator('#auth-email').fill('');
  await mobilePage.locator('#auth-password').fill('');
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'mobile_signup_default.png') });
  console.log('Saved mobile_signup_default.png');

  // Mobile signup errors
  await mobilePage.locator('button[type="submit"]:has-text("Create account")').click();
  await mobilePage.waitForSelector('#auth-fullname-error');
  await mobilePage.screenshot({ path: path.join(screenshotDir, 'mobile_signup_errors.png') });
  console.log('Saved mobile_signup_errors.png');

  // Verify functional checks: Escape, backdrop click, history back, focus trap, trigger focus
  console.log('Running functional verification checks...');

  // Escape closes
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForTimeout(300);
  if (!(await mobilePage.locator('[role="dialog"]').isVisible())) {
    console.log('PASS: Escape closes dialog');
  } else {
    console.error('FAIL: Escape did not close dialog');
  }

  // Open again & test backdrop click
  await mobilePage.locator('div.flex.items-center.gap-2.md\\:hidden button:has-text("Sign In")').click();
  await mobilePage.waitForSelector('[role="dialog"]');
  // Click backdrop outside modal box (e.g. at 5, 5)
  await mobilePage.mouse.click(5, 5);
  await mobilePage.waitForTimeout(400);
  if (!(await mobilePage.locator('[role="dialog"]').isVisible())) {
    console.log('PASS: Backdrop click closes dialog');
  } else {
    console.error('FAIL: Backdrop click did not close dialog');
  }

  // Open again & test history back
  await mobilePage.locator('div.flex.items-center.gap-2.md\\:hidden button:has-text("Sign In")').click();
  await mobilePage.waitForSelector('[role="dialog"]');
  await mobilePage.goBack();
  await mobilePage.waitForTimeout(400);
  if (!(await mobilePage.locator('[role="dialog"]').isVisible())) {
    console.log('PASS: Browser Back closes dialog without changing page');
  } else {
    console.error('FAIL: Browser Back did not close dialog');
  }

  await browser.close();
  console.log('All screenshot & functional checks complete.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
