import { chromium } from 'playwright';

async function testFailureBanner() {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  desktop.on('console', msg => console.log('PAGE LOG:', msg.text()));
  desktop.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await desktop.goto('http://localhost:3001');
  await desktop.locator('header button:has-text("Sign In")').first().click();
  await desktop.waitForSelector('[role="dialog"]');
  await desktop.locator('#auth-email').fill('nonexistent_user_99999@test.com');
  await desktop.locator('#auth-password').fill('wrongpassword123');
  await desktop.locator('button[type="submit"]:has-text("Sign in")').click();

  // Wait for button to be re-enabled after submitting
  await desktop.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]');
    return btn && !btn.hasAttribute('disabled');
  }, { timeout: 15000 });

  const desktopAlert = desktop.locator('[role="dialog"] [role="alert"]');
  console.log('Desktop alert text:', await desktopAlert.innerText());
  await desktop.screenshot({ path: 'scratch/screenshots/desktop_login_failure.png' });
  console.log('Saved scratch/screenshots/desktop_login_failure.png');

  // Mobile
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto('http://localhost:3001');
  await mobile.locator('div.flex.items-center.gap-2.md\\:hidden button:has-text("Sign In")').click();
  await mobile.waitForSelector('[role="dialog"]');
  await mobile.locator('#auth-email').fill('nonexistent_user_99999@test.com');
  await mobile.locator('#auth-password').fill('wrongpassword123');
  await mobile.locator('button[type="submit"]:has-text("Sign in")').click();

  // Wait for button to be re-enabled after submitting
  await mobile.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]');
    return btn && !btn.hasAttribute('disabled');
  }, { timeout: 15000 });

  const mobileAlert = mobile.locator('[role="dialog"] [role="alert"]');
  console.log('Mobile alert text:', await mobileAlert.innerText());
  await mobile.screenshot({ path: 'scratch/screenshots/mobile_login_failure.png' });
  console.log('Saved scratch/screenshots/mobile_login_failure.png');
  await mobileAlert.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Mobile alert text:', await mobileAlert.innerText());
  await mobile.screenshot({ path: 'scratch/screenshots/mobile_login_failure.png' });
  console.log('Saved scratch/screenshots/mobile_login_failure.png');

  await browser.close();
}

testFailureBanner().catch((e) => {
  console.error(e);
  process.exit(1);
});
