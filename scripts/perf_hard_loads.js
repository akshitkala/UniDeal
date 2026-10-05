const { chromium } = require('@playwright/test');
const fs = require('fs');

const URLS = [
  '/',
  '/browse',
  '/our-story',
  '/how-it-works',
  '/contact'
];

async function measureHardLoads() {
  const browser = await chromium.launch({ headless: true });
  
  for (const url of URLS) {
    console.log(`\n--- Measuring ${url} ---`);
    const fullUrl = `http://localhost:3000${url}`;
    
    // Cold load
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Enable performance observer for LCP and FCP
    await page.addInitScript(() => {
      window.__perfData = { fcp: null, lcp: null, cls: 0 };
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            window.__perfData.fcp = entry.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });
      
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.__perfData.lcp = lastEntry.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__perfData.cls += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    const measurePage = async (type) => {
      await page.goto(fullUrl, { waitUntil: 'load' });
      await page.waitForTimeout(2000);
      
      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const res = performance.getEntriesByType('resource');
        const transfer = res.reduce((a, r) => a + (r.transferSize || 0), 0);
        const js = res.filter(r => r.initiatorType === 'script').reduce((a, r) => a + (r.transferSize || 0), 0);
        
        return {
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          domLoad: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          load: Math.round(nav.loadEventEnd - nav.startTime),
          fcp: window.__perfData.fcp ? Math.round(window.__perfData.fcp) : null,
          lcp: window.__perfData.lcp ? Math.round(window.__perfData.lcp) : null,
          cls: window.__perfData.cls.toFixed(3),
          reqCount: res.length,
          transferKB: Math.round(transfer / 1024),
          jsKB: Math.round(js / 1024)
        };
      });
      
      console.log(`[${type}] TTFB: ${metrics.ttfb}ms | DCL: ${metrics.domLoad}ms | Load: ${metrics.load}ms | FCP: ${metrics.fcp}ms | LCP: ${metrics.lcp}ms | CLS: ${metrics.cls} | Req: ${metrics.reqCount} | Size: ${metrics.transferKB}KB (JS: ${metrics.jsKB}KB)`);
    };

    await measurePage('COLD');
    
    // Warm loads
    for (let i = 1; i <= 5; i++) {
      await page.waitForTimeout(3000);
      await measurePage(`WARM ${i}`);
    }
    
    // 60s idle load - skipping for now to save time, will simulate if needed or run in background
    console.log('[IDLE] Waiting 60s...');
    await page.waitForTimeout(60000);
    await measurePage('IDLE 60s');
    
    await context.close();
  }
  
  await browser.close();
}

measureHardLoads().catch(console.error);
