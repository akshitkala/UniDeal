const { chromium, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'checklist_report', 'retest-2026-10-17b', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const projects = [
  {
    name: 'chrome-desktop-1440',
    type: 'chromium',
    viewport: { width: 1440, height: 900 },
    isMobile: false,
  },
  {
    name: 'chrome-laptop-1024',
    type: 'chromium',
    viewport: { width: 1024, height: 768 },
    isMobile: false,
  },
  {
    name: 'safari-desktop',
    type: 'webkit',
    viewport: { width: 1440, height: 900 },
    isMobile: false,
  },
  {
    name: 'ipad',
    type: 'webkit',
    viewport: { width: 768, height: 1024 },
    isMobile: true,
  },
  {
    name: 'iphone-se-375',
    type: 'webkit',
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'iphone-14',
    type: 'webkit',
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'android-pixel-7',
    type: 'chromium',
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'android-small-360',
    type: 'chromium',
    viewport: { width: 360, height: 740 },
    isMobile: true,
    hasTouch: true,
  },
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const sampleListingSlug = 'engineering-mathematics-textbook-eAJiY';

async function run() {
  console.log(`Starting visual baseline capture across ${projects.length} projects...`);
  const results = {};

  for (const proj of projects) {
    console.log(`\nCapturing project: ${proj.name}`);
    const browserType = proj.type === 'webkit' ? webkit : chromium;
    const browser = await browserType.launch({ headless: true });
    const context = await browser.newContext({
      viewport: proj.viewport,
      isMobile: proj.isMobile,
      hasTouch: proj.hasTouch || false,
    });
    const page = await context.newPage();

    results[proj.name] = {};

    try {
      // 1. Home
      console.log(`  -> Capturing Home...`);
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      const homePath = path.join(outDir, `baseline_${proj.name}_home.png`);
      await page.screenshot({ path: homePath, fullPage: true });
      results[proj.name].home = homePath;

      // 2. Browse
      console.log(`  -> Capturing Browse...`);
      await page.goto(`${BASE_URL}/browse`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      const browsePath = path.join(outDir, `baseline_${proj.name}_browse.png`);
      await page.screenshot({ path: browsePath, fullPage: true });
      results[proj.name].browse = browsePath;

      // 3. Listing Detail
      console.log(`  -> Capturing Listing Detail...`);
      await page.goto(`${BASE_URL}/listing/${sampleListingSlug}`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(1000);
      const detailPath = path.join(outDir, `baseline_${proj.name}_listing_detail.png`);
      await page.screenshot({ path: detailPath, fullPage: true });
      results[proj.name].listing_detail = detailPath;

      // 4. Auth Modal
      console.log(`  -> Capturing Auth Modal...`);
      // Go to home and trigger auth modal via Sell or Sign In
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(500);
      
      // On mobile, the desktop button is in DOM first (hidden with md:flex), so we must select :visible
      const signInBtn = page.locator('button:has-text("Sign In"):visible').first();
      const sellBtn = page.locator('button:has-text("Sell"):visible, a:has-text("Sell"):visible').first();
      const menuBtn = page.locator('button[aria-label="Toggle menu"]:visible').first();

      let modalOpened = false;
      if (await signInBtn.isVisible()) {
        await signInBtn.click();
        modalOpened = true;
      } else if (await sellBtn.isVisible()) {
        await sellBtn.click();
        modalOpened = true;
      } else if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForTimeout(400);
        const mobileSignIn = page.locator('button:has-text("Sign In"):visible').first();
        if (await mobileSignIn.isVisible()) {
          await mobileSignIn.click();
          modalOpened = true;
        }
      }

      // Fallback: click any element that opens modal or navigate to /sell which gates
      if (!modalOpened) {
        await page.goto(`${BASE_URL}/sell`, { waitUntil: 'networkidle' });
      }

      await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
      await page.waitForTimeout(500);
      const modalPath = path.join(outDir, `baseline_${proj.name}_auth_modal.png`);
      await page.screenshot({ path: modalPath, fullPage: false });
      results[proj.name].auth_modal = modalPath;

      console.log(`  -> Completed ${proj.name} successfully.`);
    } catch (err) {
      console.error(`  -> ERROR on ${proj.name}:`, err.message);
      results[proj.name].error = err.message;
    } finally {
      await browser.close();
    }
  }

  const manifestPath = path.join(__dirname, '..', 'checklist_report', 'retest-2026-10-17b', 'visual-baselines.json');
  fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nVisual baselines capture complete! Manifest saved to ${manifestPath}`);
}

run().catch(err => {
  console.error('Fatal error in visual capture:', err);
  process.exit(1);
});
