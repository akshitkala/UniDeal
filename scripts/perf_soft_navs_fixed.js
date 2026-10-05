const { chromium } = require('@playwright/test');

async function measureSoftNavsFixed() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const adminEmail = process.env.PERF_ADMIN_EMAIL;
  const adminPassword = process.env.PERF_ADMIN_PASSWORD;
  
  await page.goto('http://localhost:3000/');
  try {
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.fill('#auth-email', adminEmail);
    await page.fill('#auth-password', adminPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('Login failed:', e.message);
  }

  async function measureClick(startUrl, linkSelector, name, waitForUrlPart) {
    console.log(`\n--- Soft Nav: ${name} ---`);
    for (let i = 0; i < 6; i++) {
      await page.goto(startUrl, { waitUntil: 'load' });
      await page.waitForTimeout(1000); // Wait for things to settle
      
      const requests = [];
      const onReq = req => requests.push({ url: req.url(), start: Date.now(), reqObj: req });
      page.on('request', onReq);
      
      // We will inject a MutationObserver to precisely measure DOM changes
      await page.evaluate(() => {
        window.navEvents = { skeletons: 0, finalContent: null, startTime: null };
        const observer = new MutationObserver((mutations) => {
          const now = performance.now();
          if (document.body.innerHTML.includes('animate-pulse') || document.body.innerHTML.includes('skeleton')) {
            if (!window.navEvents.skeletonTime) window.navEvents.skeletonTime = now;
          } else {
             window.navEvents.finalTime = now;
          }
        });
        observer.observe(document.querySelector('main') || document.body, { childList: true, subtree: true, characterData: true });
        window.__navObserver = observer;
      });

      const clickStart = Date.now();
      await page.evaluate(() => { window.navEvents.startTime = performance.now(); });
      
      await page.click(linkSelector);
      
      // Wait for the specific data request to finish
      let reqDurations = [];
      if (waitForUrlPart) {
         try {
           const res = await page.waitForResponse(r => r.url().includes(waitForUrlPart), { timeout: 10000 });
           reqDurations.push({ url: res.url(), dur: Date.now() - clickStart });
         } catch(e) { }
      }
      
      // Wait a bit to ensure React renders
      await page.waitForTimeout(200);
      
      const navEvents = await page.evaluate(() => {
        window.__navObserver.disconnect();
        return window.navEvents;
      });
      
      page.off('request', onReq);
      
      let finalMs = navEvents.finalTime ? Math.round(navEvents.finalTime - navEvents.startTime) : Date.now() - clickStart;
      let skelMs = navEvents.skeletonTime ? Math.round(navEvents.skeletonTime - navEvents.startTime) : null;
      
      console.log(`[${i===0?'COLD':'WARM ' + i}] Click to Skeleton: ${skelMs||'none'}ms | Click to Final: ${finalMs}ms`);
      
      if (i > 0 && i < 3) {
         const apiReqs = requests.filter(r => r.url.includes('/api/') || r.url.includes('supabase') || r.url.includes('_rsc'));
         apiReqs.forEach(r => console.log(`  Req: ${new URL(r.url).pathname} started at +${r.start - clickStart}ms`));
      }
    }
  }

  await measureClick('http://localhost:3000/admin', 'a[href="/admin/listings/pending"]', 'Admin -> Pending', 'pending');
  await measureClick('http://localhost:3000/admin/listings/pending', 'a[href="/admin/reports"]', 'Pending -> Reports', 'reports');
  await measureClick('http://localhost:3000/admin/reports', 'a[href="/admin/users"]', 'Reports -> Users', 'users');
  await measureClick('http://localhost:3000/admin/users', 'a[href="/admin"]', 'Users -> Admin Overview', 'settings');

  await context.close();
  await browser.close();
}

measureSoftNavsFixed().catch(console.error);
