/**
 * QA fix-pass verification — report.md tickets QA-01..QA-09 (2026-09-22).
 * Exercises the real server routes with real Supabase session cookies,
 * exactly as the browser would (middleware + route auth paths).
 *
 * Run: node --env-file=.env.local scripts/test_qa_fix_pass.js
 * Requires: `npm run dev` running on http://localhost:3000
 */
const { createClient } = require('@supabase/supabase-js');
const { stringToBase64URL } = require('@supabase/ssr/dist/main/utils/base64url');
const { createChunks } = require('@supabase/ssr/dist/main/utils/chunker');

const BASE = 'http://localhost:3000';
const USER_EMAIL = 'qa_verify_user@campus.edu';
const ADMIN_EMAIL = 'qa_admin_user@campus.edu';
const SELLER_EMAIL = 'qa_seller_user@campus.edu';
const PW = 'QaVerify123!';
const MY_NUMBER = '+911234567890';
const SELLER_NUMBER = '+919876500001';

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, ok: !!cond });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
}

function cookieHeader(session) {
  const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
  const encoded = 'base64-' + stringToBase64URL(JSON.stringify(session));
  const chunks = createChunks(`sb-${ref}-auth-token`, encoded);
  return chunks.map((c) => `${c.name}=${c.value}`).join('; ');
}

async function login(anon, email) {
  const { data, error } = await anon.auth.signInWithPassword({ email, password: PW });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return data.session;
}

async function req(path, cookie, opts = {}) {
  return fetch(BASE + path, {
    redirect: 'manual',
    ...opts,
    headers: { ...(cookie ? { Cookie: cookie } : {}), ...(opts.headers || {}) },
  });
}

async function ensureUser(admin, email) {
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password: PW, email_confirm: true, user_metadata: { full_name: 'QA Test Student' },
  });
  if (!error) return created.user;
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 100 });
  const found = (list?.users || []).find((u) => u.email === email);
  if (found) return found;
  throw new Error(`cannot create/find ${email}: ${error.message}`);
}

(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    console.error('Missing Supabase environment variables (use --env-file=.env.local)');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey);
  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // --- fixtures (idempotent) ---
  const user = await ensureUser(admin, USER_EMAIL);
  const adminUser = await ensureUser(admin, ADMIN_EMAIL);
  const seller = await ensureUser(admin, SELLER_EMAIL);
  await admin.from('profiles').update({ whatsapp_number: MY_NUMBER }).eq('id', user.id);
  await admin.from('profiles').update({ whatsapp_number: SELLER_NUMBER, full_name: 'QA Seller Student' }).eq('id', seller.id);
  await admin.from('profiles').update({ is_admin: true }).eq('id', adminUser.id);

  let listing;
  {
    const { data: existing } = await admin.from('listings').select('id, slug').eq('slug', 'qa-test-calculator').maybeSingle();
    if (existing) {
      listing = existing;
    } else {
      const { data: cat } = await admin.from('categories').select('id').limit(1).single();
      const { data: inserted, error } = await admin.from('listings').insert({
        slug: 'qa-test-calculator',
        seller_id: seller.id,
        title: 'QA Test Calculator',
        description: 'Fixture listing for QA fix-pass verification.',
        price: 499,
        category_id: cat.id,
        condition: 'Good',
        images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
        status: 'approved',
      }).select('id, slug').single();
      if (error) throw new Error(`listing create: ${error.message}`);
      listing = inserted;
    }
  }

  const userSession = await login(anon, USER_EMAIL);
  const adminSession = await login(anon, ADMIN_EMAIL);
  const userCookie = cookieHeader(userSession);
  const adminCookie = cookieHeader(adminSession);

  // --- Part 1: pages load (guest) ---
  for (const p of ['/', '/browse', '/how-it-works', '/our-story', '/contact']) {
    const r = await req(p, null);
    check(`Part1 GET ${p} -> 200`, r.status === 200, `got ${r.status}`);
  }

  // --- Part 2: Auth Modal backend contract (same signInWithPassword the modal calls) ---
  check('Part2 signInWithPassword (modal auth call) -> session', !!userSession.access_token && !!userSession.user);
  const homeAuthed = await req('/', userCookie);
  check('Part2 middleware accepts session on / -> 200', homeAuthed.status === 200, `got ${homeAuthed.status}`);

  // --- QA-01: server-side admin guard ---
  const gAdmin = await req('/admin', null);
  check('QA-01 guest GET /admin redirects to /', [302, 303, 307].includes(gAdmin.status) && gAdmin.headers.get('location') === '/', `got ${gAdmin.status} loc=${gAdmin.headers.get('location')}`);
  const uAdmin = await req('/admin', userCookie);
  check('QA-01 non-admin GET /admin redirects to /', [302, 303, 307].includes(uAdmin.status) && uAdmin.headers.get('location') === '/', `got ${uAdmin.status} loc=${uAdmin.headers.get('location')}`);
  const uPending = await req('/admin/listings/pending', userCookie);
  check('QA-01 non-admin GET /admin/listings/pending redirects', [302, 303, 307].includes(uPending.status), `got ${uPending.status}`);
  const aAdmin = await req('/admin', adminCookie);
  const aHtml = aAdmin.status === 200 ? await aAdmin.text() : '';
  check('QA-01 admin GET /admin renders console', aAdmin.status === 200 && aHtml.includes('UniDeal Admin Console'), `got ${aAdmin.status}`);

  // --- QA-02: owner-only WhatsApp number ---
  const gProfile = await req('/api/profile', null);
  check('QA-02 guest GET /api/profile -> 401', gProfile.status === 401, `got ${gProfile.status}`);
  const uProfile = await req('/api/profile', userCookie);
  const pData = uProfile.status === 200 ? (await uProfile.json()).data : null;
  check('QA-02 owner GET /api/profile -> 200 with saved number', uProfile.status === 200 && pData?.whatsapp_number === MY_NUMBER, `status=${uProfile.status} number=${pData?.whatsapp_number}`);
  check('QA-02 profile includes editable fields', !!(pData?.full_name && 'branch' in pData && 'year' in pData));
  const aProfile = await req('/api/profile', adminCookie);
  const aData = aProfile.status === 200 ? (await aProfile.json()).data : null;
  check('QA-02 other user gets only THEIR number (admin sees own, not mine)', aData?.whatsapp_number !== MY_NUMBER, `got ${aData?.whatsapp_number}`);
  const profilePage = await req('/profile', userCookie);
  check('QA-02 GET /profile page -> 200', profilePage.status === 200, `got ${profilePage.status}`);

  // --- QA-03: admin overview counts ---
  const gOv = await req('/api/admin/overview', null);
  check('QA-03 guest GET /api/admin/overview -> 401', gOv.status === 401, `got ${gOv.status}`);
  const uOv = await req('/api/admin/overview', userCookie);
  check('QA-03 non-admin GET /api/admin/overview -> 403', uOv.status === 403, `got ${uOv.status}`);
  const aOv = await req('/api/admin/overview', adminCookie);
  const ov = aOv.status === 200 ? (await aOv.json()).data : null;
  check('QA-03 admin GET /api/admin/overview -> 200 with counts', aOv.status === 200 && Number.isInteger(ov?.pending_listings) && Number.isInteger(ov?.open_reports) && ov?.total_users >= 3, JSON.stringify(ov));

  // --- QA-04: public_profiles exposes is_admin for nav gating (both outcomes) ---
  const { data: vRow } = await anon.from('public_profiles').select('is_admin').eq('id', user.id).maybeSingle();
  const { data: aRow } = await anon.from('public_profiles').select('is_admin').eq('id', adminUser.id).maybeSingle();
  check('QA-04 public_profiles is_admin=false for non-admin', vRow?.is_admin === false);
  check('QA-04 public_profiles is_admin=true for admin', aRow?.is_admin === true);

  // --- Part 3: Contact Seller end-to-end ---
  const gContact = await req(`/api/listings/${listing.id}/contact`, null, { method: 'POST' });
  check('Part3 guest POST contact -> 401', gContact.status === 401, `got ${gContact.status}`);
  const uContact = await req(`/api/listings/${listing.id}/contact`, userCookie, { method: 'POST' });
  const cBody = uContact.status === 200 ? await uContact.json() : null;
  const waLink = cBody?.data?.waLink || '';
  check('Part3 verified user POST contact -> 200 waLink', uContact.status === 200 && waLink.startsWith('https://wa.me/'), `status=${uContact.status}`);
  check('Part3 waLink targets seller number + prefilled title', waLink.includes(SELLER_NUMBER.replace('+', '')) && waLink.includes('QA%20Test%20Calculator') || waLink.includes('QA Test Calculator'), waLink.slice(0, 90));
  check('Part3 response shape is {data:{waLink}} only — no raw number field', cBody && JSON.stringify(Object.keys(cBody.data)) === '["waLink"]');
  const { data: revealRows } = await admin.from('contact_reveals').select('id').eq('user_id', user.id).eq('listing_id', listing.id);
  check('Part3 contact_reveals audit row inserted', (revealRows || []).length >= 1, `rows=${(revealRows || []).length}`);

  // --- Part 8 / QA-08 backend: contact form validation ---
  const cInvalid = await req('/api/contact', null, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  check('Part8 POST /api/contact invalid -> 400 with message', cInvalid.status === 400 && !!(await cInvalid.json())?.error?.message, `got ${cInvalid.status}`);

  // --- Part 4 regression: dashboard renders for seller view ---
  const dash = await req('/dashboard', userCookie);
  check('Part4 GET /dashboard -> 200', dash.status === 200, `got ${dash.status}`);

  // --- summary ---
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('FAILED:', failed.map((f) => f.name).join(' | '));
    process.exit(1);
  }
  console.log('ALL QA FIX-PASS CHECKS PASSED');
})().catch((err) => {
  console.error('Error during QA fix-pass run:', err);
  process.exit(1);
});
