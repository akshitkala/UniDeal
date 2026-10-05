const { chromium } = require('@playwright/test');

const URLS = [
  '/admin', 
  '/admin/listings/pending', 
  '/admin/reports', 
  '/admin/users',
  '/api/admin/settings', 
  '/api/admin/overview', 
  '/api/admin/listings/pending', 
  '/api/admin/reports'
];

async function verifyAuth() {
  console.log('--- Unauthenticated Requests ---');
  for (const url of URLS) {
    const res = await fetch(`http://localhost:3000${url}`);
    console.log(`Unauth ${url}: ${res.status} ${res.url}`);
    if (res.status === 200 && !res.url.endsWith('/')) {
      console.error(`ERROR: ${url} returned 200 for unauthenticated user!`);
    }
  }

  console.log('\n--- Non-Admin (Student) Requests ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/');
  try {
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.fill('#auth-email', process.env.PERF_USER_EMAIL);
    await page.fill('#auth-password', process.env.PERF_USER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  } catch (e) {
    console.log('Login failed:', e.message);
  }

  // Get cookies and make fetch requests
  const cookies = await context.cookies();
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  for (const url of URLS) {
    const res = await fetch(`http://localhost:3000${url}`, {
      headers: { cookie: cookieHeader }
    });
    console.log(`Non-Admin ${url}: ${res.status} ${res.url}`);
    if (res.status === 200 && !res.url.endsWith('/')) {
      console.error(`ERROR: ${url} returned 200 for non-admin user!`);
    }
  }

  await browser.close();
}

verifyAuth().catch(console.error);
