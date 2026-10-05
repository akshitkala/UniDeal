const { chromium } = require('@playwright/test');

async function measureSoftNavs() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Login as admin for all admin navs
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

  async function measureClick(startUrl, linkSelector, name) {
    console.log(`\n--- Soft Nav: ${name} ---`);
    for (let i = 0; i < 6; i++) {
      await page.goto(startUrl, { waitUntil: 'networkidle' });
      
      const requests = [];
      const onReq = req => requests.push({ url: req.url(), start: Date.now(), type: req.resourceType(), reqObj: req });
      page.on('request', onReq);
      
      const clickStart = Date.now();
      await page.click(linkSelector);
      
      // wait for skeleton to appear (first visual change) - rough approximation
      let firstChange = null;
      try {
        await page.waitForSelector('.animate-pulse', { timeout: 2000 });
        firstChange = Date.now() - clickStart;
      } catch (e) {
        // no skeleton appeared, or it was too fast
      }
      
      // wait for network to settle for final content
      await page.waitForLoadState('networkidle');
      const finalChange = Date.now() - clickStart;
      
      page.off('request', onReq);
      
      const reqStats = await Promise.all(requests.map(async r => {
        try {
          const timing = r.reqObj.timing();
          return { url: r.url, startOffset: r.start - clickStart, type: r.type, responseEnd: timing ? timing.responseEnd : -1 };
        } catch { return null; }
      }));
      
      const validReqs = reqStats.filter(r => r && (r.url.includes('/api/') || r.url.includes('_rsc') || r.url.includes('supabase')));
      
      console.log(`[${i===0?'COLD':'WARM ' + i}] First Change: ${firstChange || '<200'}ms | Final: ${finalChange}ms | Reqs: ${validReqs.length}`);
      if (i > 0 && i < 3) {
        validReqs.forEach(r => console.log(`  -> ${new URL(r.url).pathname} (+${r.startOffset}ms)`));
      }
      if (i < 5) await page.waitForTimeout(3000);
    }
  }

  // Admin Loop
  await measureClick('http://localhost:3000/admin', 'a[href="/admin/listings/pending"]', 'Admin -> Pending');
  await measureClick('http://localhost:3000/admin/listings/pending', 'a[href="/admin/reports"]', 'Pending -> Reports');
  await measureClick('http://localhost:3000/admin/reports', 'a[href="/admin/users"]', 'Reports -> Users');
  await measureClick('http://localhost:3000/admin/users', 'a[href="/admin"]', 'Users -> Admin Overview');

  // Public Loop (Logout first?) 
  // Wait, I can just navigate to public pages while logged in, it's fine.
  await measureClick('http://localhost:3000/', 'a[href="/browse"]', 'Home -> Browse');
  
  // For browse -> listing, we need to click a listing card
  console.log(`\n--- Soft Nav: Browse -> Listing ---`);
  for (let i = 0; i < 6; i++) {
    await page.goto('http://localhost:3000/browse', { waitUntil: 'networkidle' });
    const requests = [];
    const onReq = req => requests.push({ url: req.url(), start: Date.now(), reqObj: req });
    page.on('request', onReq);
    
    const clickStart = Date.now();
    await page.click('a[href^="/listing/"]:not([href*="edit"])');
    
    try { await page.waitForSelector('.animate-pulse', { timeout: 2000 }); } catch (e) {}
    await page.waitForLoadState('networkidle');
    const finalChange = Date.now() - clickStart;
    page.off('request', onReq);
    
    const validReqs = requests.filter(r => r.url.includes('/api/') || r.url.includes('_rsc') || r.url.includes('supabase'));
    console.log(`[${i===0?'COLD':'WARM ' + i}] Final: ${finalChange}ms | Reqs: ${validReqs.length}`);
    if (i < 5) await page.waitForTimeout(3000);
  }

  // Account Loop
  await measureClick('http://localhost:3000/dashboard', 'a[href="/profile"]', 'Dashboard -> Profile');

  await context.close();
  await browser.close();
}

measureSoftNavs().catch(console.error);
