const { chromium } = require('@playwright/test');

const URLS = [
  '/admin',
  '/admin/listings/pending',
  '/admin/reports',
  '/admin/users',
  '/dashboard',
  '/profile',
  '/sell'
];

async function measureAuthHardLoads() {
  const browser = await chromium.launch({ headless: true });
  
  for (const url of URLS) {
    console.log(`\n--- Measuring ${url} ---`);
    const fullUrl = `https://uni-deal-one.vercel.app${url}`;
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login logic
    console.log('Logging in...');
    await page.goto('https://uni-deal-one.vercel.app/');
    
    // Quick login by setting the cookie manually to save time, or actually logging in via UI?
    // The prompt says "Do NOT click... Sign Up. Open pages and navigate only. Logging in is allowed."
    // Let's click the login button and fill the form.
    // Based on the app, the AuthModal uses email link, but wait!
    // "Auth is the AuthModal component only; there are no /login or /signup routes... Supabase email-link callback"
    // The instructions say "Credentials come from env vars (PERF_USER_EMAIL/PASSWORD, PERF_ADMIN_EMAIL/PASSWORD)."
    // Since there are passwords, they must be using password-based login in the modal.
    
    // Fill email and password. I'll read credentials from process.env
    const email = url.startsWith('/admin') ? process.env.PERF_ADMIN_EMAIL : process.env.PERF_USER_EMAIL;
    const password = url.startsWith('/admin') ? process.env.PERF_ADMIN_PASSWORD : process.env.PERF_USER_PASSWORD;
    
    try {
      await page.getByRole('button', { name: 'Sign In', exact: true }).click();
      await page.fill('#auth-email', email);
      await page.fill('#auth-password', password);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000); // wait for session to settle
    } catch (e) {
      console.log('Login failed or modal different:', e.message);
    }
    
    await page.addInitScript(() => {
      window.__perfData = { fcp: null, lcp: null, cls: 0 };
      new PerformanceObserver((eList) => { for(let e of eList.getEntries()) if(e.name==='first-contentful-paint') window.__perfData.fcp=e.startTime; }).observe({type:'paint',buffered:true});
      new PerformanceObserver((eList) => { const es=eList.getEntries(); window.__perfData.lcp=es[es.length-1].startTime; }).observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver((eList) => { for(let e of eList.getEntries()) if(!e.hadRecentInput) window.__perfData.cls+=e.value; }).observe({type:'layout-shift',buffered:true});
    });

    const measurePage = async (type) => {
      await page.goto(fullUrl, { waitUntil: 'load' });
      await page.waitForTimeout(2000);
      
      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const res = performance.getEntriesByType('resource');
        return {
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          domLoad: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          load: Math.round(nav.loadEventEnd - nav.startTime),
          fcp: window.__perfData.fcp ? Math.round(window.__perfData.fcp) : null,
          lcp: window.__perfData.lcp ? Math.round(window.__perfData.lcp) : null,
          cls: window.__perfData.cls.toFixed(3),
          reqCount: res.length
        };
      });
      
      console.log(`[${type}] TTFB: ${metrics.ttfb}ms | DCL: ${metrics.domLoad}ms | Load: ${metrics.load}ms | FCP: ${metrics.fcp}ms | LCP: ${metrics.lcp}ms | Req: ${metrics.reqCount}`);
    };

    await measurePage('COLD');
    
    for (let i = 1; i <= 5; i++) {
      await page.waitForTimeout(3000);
      await measurePage(`WARM ${i}`);
    }
    
    console.log('[IDLE] Waiting 60s...');
    await page.waitForTimeout(60000);
    await measurePage('IDLE 60s');
    
    await context.close();
  }
  
  await browser.close();
}

measureAuthHardLoads().catch(console.error);
