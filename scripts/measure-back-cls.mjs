import { chromium } from '@playwright/test';
import fs from 'fs';

async function measureCLSOnBack() {
  console.log('Launching Chromium for PerformanceObserver CLS measurement under 4x CPU slowdown and Slow-4G...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  // Apply 4x CPU throttling
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  // Apply Slow-4G network throttling
  // Latency: 150ms, Download: 1.6 Mbps (200 KB/s), Upload: 750 Kbps (93.75 KB/s)
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    connectionType: 'cellular4g',
  });

  // Navigate to /browse
  await page.goto('http://localhost:3000/browse');
  await page.waitForLoadState('networkidle');

  // Scroll down to listing 6
  const cards = page.locator('a[href^="/listing/"]');
  await cards.nth(5).scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Click listing to navigate away
  await cards.nth(5).click();
  await page.waitForURL(/\/listing\//);
  await page.waitForLoadState('networkidle');

  // Register PerformanceObserver before navigating back
  await page.evaluate(() => {
    window.__measuredCLS = 0;
    window.__clsEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__measuredCLS += entry.value;
          window.__clsEntries.push({
            value: entry.value,
          });
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  });

  // Navigate back to /browse
  await page.goBack();
  await page.waitForURL(/\/browse/);
  await page.waitForTimeout(2000); // Wait under 4x CPU slowdown for layout shifts to complete

  // Extract CLS from PerformanceObserver (buffered: true)
  const clsData = await page.evaluate(() => {
    return {
      cls: window.__measuredCLS || 0,
      entries: window.__clsEntries || [],
    };
  });

  console.log('\n=======================================');
  console.log('PERFORMANCE OBSERVER BACK-NAV CLS RESULT');
  console.log('=======================================');
  console.log('Throttling: 4x CPU Slowdown + Slow-4G Network');
  console.log('Measured CLS on Back Navigation:', clsData.cls);
  console.log('Layout shift entries count:', clsData.entries.length);
  console.log('Target (< 0.1):', clsData.cls < 0.1 ? 'PASS' : 'FAIL');

  fs.writeFileSync(
    'checklist_report/lighthouse/browse-back-cls-measured.json',
    JSON.stringify(
      {
        throttling: '4x CPU + Slow-4G',
        measuredCLS: clsData.cls,
        target: '< 0.1',
        passed: clsData.cls < 0.1,
        entries: clsData.entries,
      },
      null,
      2
    )
  );

  await browser.close();
}

measureCLSOnBack().catch((err) => {
  console.error('CLS measurement failed:', err);
  process.exit(1);
});
