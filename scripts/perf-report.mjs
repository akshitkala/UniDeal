import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { stringToBase64URL } from '@supabase/ssr/dist/main/utils/base64url.js';
import { createChunks } from '@supabase/ssr/dist/main/utils/chunker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env.local manually if not in process.env
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const BASE_URL = process.env.PERF_BASE_URL || 'http://localhost:3000';
const IS_PROD_RUN = process.argv.includes('--prod');
const IS_IDLE_TEST = process.argv.includes('--idle');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const ref = new URL(SUPABASE_URL).hostname.split('.')[0];

function makeCookieHeader(session) {
  if (!session) return '';
  const encoded = 'base64-' + stringToBase64URL(JSON.stringify(session));
  const chunks = createChunks(`sb-${ref}-auth-token`, encoded);
  return chunks.map((c) => `${c.name}=${c.value}`).join('; ');
}

async function getAuthCookies() {
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const userEmail = process.env.PERF_USER_EMAIL;
  const userPassword = process.env.PERF_USER_PASSWORD;
  const adminEmail = process.env.PERF_ADMIN_EMAIL;
  const adminPassword = process.env.PERF_ADMIN_PASSWORD;

  if (!userEmail || !userPassword || !adminEmail || !adminPassword) {
    console.error('Missing PERF credentials in environment or .env.local');
    process.exit(1);
  }

  const { data: userData, error: userErr } = await anon.auth.signInWithPassword({
    email: userEmail,
    password: userPassword,
  });
  if (userErr) throw new Error(`User login failed: ${userErr.message}`);

  const { data: adminData, error: adminErr } = await anon.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });
  if (adminErr) throw new Error(`Admin login failed: ${adminErr.message}`);

  return {
    userCookie: makeCookieHeader(userData.session),
    adminCookie: makeCookieHeader(adminData.session),
  };
}

const ROUTES = [
  // Pages
  { path: '/', type: 'page', auth: 'public' },
  { path: '/browse', type: 'page', auth: 'public' },
  { path: '/listing/engineering-mathematics-textbook-eAJiY', type: 'page', auth: 'public' },
  { path: '/our-story', type: 'page', auth: 'public' },
  { path: '/how-it-works', type: 'page', auth: 'public' },
  { path: '/contact', type: 'page', auth: 'public' },
  { path: '/verify-email', type: 'page', auth: 'guest' },
  { path: '/sell', type: 'page', auth: 'user' },
  { path: '/dashboard', type: 'page', auth: 'user' },
  { path: '/profile', type: 'page', auth: 'user' },
  { path: '/listing/engineering-mathematics-textbook-eAJiY/edit', type: 'page', auth: 'user' },
  { path: '/admin', type: 'page', auth: 'admin' },
  { path: '/admin/listings/pending', type: 'page', auth: 'admin' },
  { path: '/admin/reports', type: 'page', auth: 'admin' },
  { path: '/admin/users', type: 'page', auth: 'admin' },

  // API GET routes
  { path: '/api/listings', type: 'api', auth: 'public' },
  { path: '/api/listings?search=calculator', type: 'api', auth: 'public' },
  { path: '/api/listings?category=books-notes', type: 'api', auth: 'public' },
  { path: '/api/listings?sort=price_asc', type: 'api', auth: 'public' },
  { path: '/api/admin/settings', type: 'api', auth: 'admin' },
  { path: '/api/admin/overview', type: 'api', auth: 'admin' },
  { path: '/api/admin/listings/pending', type: 'api', auth: 'admin' },
  { path: '/api/admin/reports', type: 'api', auth: 'admin' },
  { path: '/api/profile', type: 'api', auth: 'user' },
  { path: '/api/cron/keepalive', type: 'api', auth: 'cron' },
];

async function measureHit(route, cookies) {
  const headers = {};
  if (route.auth === 'user') headers.Cookie = cookies.userCookie;
  if (route.auth === 'admin') headers.Cookie = cookies.adminCookie;
  if (route.auth === 'cron') headers.Authorization = `Bearer ${process.env.CRON_SECRET}`;

  const url = `${BASE_URL}${route.path}`;
  const start = performance.now();
  let ttfb = 0;
  let status = 0;
  let size = 0;
  let middlewareMs = null;
  let handlerMs = null;

  try {
    const res = await fetch(url, {
      headers,
      redirect: 'manual',
    });
    ttfb = performance.now() - start;
    status = res.status;
    middlewareMs = res.headers.get('x-perf-middleware-ms');
    handlerMs = res.headers.get('x-perf-handler-ms');

    const text = await res.text();
    const total = performance.now() - start;
    size = Buffer.byteLength(text, 'utf8');

    return {
      status,
      ttfb: Math.round(ttfb),
      total: Math.round(total),
      size,
      middlewareMs: middlewareMs ? parseFloat(middlewareMs) : null,
      handlerMs: handlerMs ? parseFloat(handlerMs) : null,
    };
  } catch (err) {
    return {
      status: 0,
      ttfb: 0,
      total: 0,
      size: 0,
      error: err.message,
    };
  }
}

function calculateStats(arr) {
  if (!arr.length) return { min: 0, median: 0, max: 0, avg: 0 };
  const sorted = [...arr].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  const avg = Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length);
  return { min, median, max, avg };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  console.log(`\n========================================`);
  console.log(`UniDeal Performance Benchmark Script`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Mode: ${IS_PROD_RUN ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`========================================\n`);

  const cookies = await getAuthCookies();
  const results = [];

  for (const route of ROUTES) {
    console.log(`Measuring: [${route.auth.toUpperCase()}] ${route.path}...`);

    // First hit (Cold / First load)
    const firstHit = await measureHit(route, cookies);
    await sleep(300);

    let idleHit = null;
    if (IS_IDLE_TEST) {
      console.log(`   Waiting 60s idle for ${route.path}...`);
      await sleep(60000);
      idleHit = await measureHit(route, cookies);
      await sleep(300);
    }

    // 5 warm hits sequential, 300ms apart
    const warmHits = [];
    for (let i = 0; i < 5; i++) {
      const hit = await measureHit(route, cookies);
      warmHits.push(hit);
      if (i < 4) await sleep(300);
    }

    const warmTotals = warmHits.map((h) => h.total);
    const warmTTFBs = warmHits.map((h) => h.ttfb);
    const totalStats = calculateStats(warmTotals);
    const ttfbStats = calculateStats(warmTTFBs);

    const verdict =
      totalStats.median < 300 ? 'Fast (<300ms)' : totalStats.median <= 800 ? 'OK (300-800ms)' : 'Slow (>800ms)';

    results.push({
      path: route.path,
      type: route.type,
      auth: route.auth,
      firstHit,
      idleHit,
      warmHits,
      warmTotalStats: totalStats,
      warmTTFBStats: ttfbStats,
      verdict,
    });
  }

  const reportDataPath = path.join(
    __dirname,
    '..',
    `scratch/perf-results-${IS_PROD_RUN ? 'prod' : 'dev'}${IS_IDLE_TEST ? '-idle' : ''}.json`
  );
  fs.mkdirSync(path.dirname(reportDataPath), { recursive: true });
  fs.writeFileSync(reportDataPath, JSON.stringify(results, null, 2));

  console.log(`\nMeasurement Complete! Results written to: ${reportDataPath}\n`);

  console.log(`SUMMARY TABLE:`);
  console.log(`-----------------------------------------------------------------------------------------`);
  console.log(`Route | Auth | First Total | Warm Min/Med/Max | Verdict`);
  console.log(`-----------------------------------------------------------------------------------------`);
  for (const r of results) {
    console.log(
      `${r.path.padEnd(45)} | ${r.auth.padEnd(5)} | ${String(r.firstHit.total + 'ms').padEnd(8)} | ${r.warmTotalStats.min}/${r.warmTotalStats.median}/${r.warmTotalStats.max}ms | ${r.verdict}`
    );
  }
  console.log(`-----------------------------------------------------------------------------------------\n`);
})().catch((err) => {
  console.error('Fatal benchmark error:', err);
  process.exit(1);
});
