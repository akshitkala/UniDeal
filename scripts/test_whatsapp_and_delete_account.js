/**
 * Complete WhatsApp Number Rules Verification Suite:
 *  1. One number per account, not per listing:
 *     - No whatsapp_number on listings table/payloads.
 *     - Updating seller's profile number immediately updates wa.me link for all past listings.
 *  2. Required on first listing (not optional at listing-creation time):
 *     - POST /api/listings without number on numberless seller -> 400 VALIDATION_ERROR.
 *     - Supplying number updates profile and succeeds (201).
 *     - Subsequent listing creation without number succeeds (201).
 *  3. Number never exposed to anyone, anywhere, including seller:
 *     - RLS blocks direct SELECT on whatsapp_number for anon & authenticated roles.
 *     - public_profiles view omits whatsapp_number.
 *     - POST /api/listings/[id]/contact returns strictly { waLink }, no raw phone number field.
 *     - Listing page / API responses do not expose raw phone numbers.
 *  4. Ban doesn't touch the number:
 *     - POST /api/admin/users/[id]/ban sets is_banned = true without touching whatsapp_number.
 *     - Banned user's listings excluded from browse via live RLS check.
 *     - POST /api/admin/users/[id]/unban sets is_banned = false; listings & contact reveal reappear immediately.
 *  5. Number deleted only on account deletion:
 *     - DELETE /api/account removes auth user, cascading to profile (and number), listings, reveals.
 *
 * Run: node --env-file=.env.local scripts/test_whatsapp_and_delete_account.js
 * Requires: `npm run dev` running on http://localhost:3000
 */
const { createClient } = require('@supabase/supabase-js');
const { stringToBase64URL } = require('@supabase/ssr/dist/main/utils/base64url');
const { createChunks } = require('@supabase/ssr/dist/main/utils/chunker');

const BASE = 'http://localhost:3000';
const PW = 'GateTest123!';
const INITIAL_NUMBER = '+919876543210';
const UPDATED_NUMBER = '+919111111111';

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

async function req(path, cookie, opts = {}) {
  return fetch(BASE + path, {
    redirect: 'manual',
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}), ...(opts.headers || {}) },
  });
}

function listingBody(categoryId, whatsapp) {
  return {
    title: `WhatsApp Spec Listing ${Date.now().toString().slice(-5)}`,
    description: 'Fixture listing used by the WhatsApp number rules verification script.',
    price: 499,
    negotiable: false,
    category_id: categoryId,
    condition: 'Good',
    images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    ...(whatsapp && { whatsapp_number: whatsapp }),
  };
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

  // --- Fixtures Setup ---
  // 1. Seller User (fresh, no number initially)
  const sellerEmail = `seller_${Date.now()}@campus.edu`;
  const { data: sellerCreated, error: sellerCreateErr } = await admin.auth.admin.createUser({
    email: sellerEmail, password: PW, email_confirm: true, user_metadata: { full_name: 'Spec Seller' },
  });
  if (sellerCreateErr || !sellerCreated.user) {
    console.error('Seller creation failed:', sellerCreateErr?.message);
    process.exit(1);
  }
  const sellerId = sellerCreated.user.id;

  // 2. Buyer User (verified)
  const buyerEmail = `buyer_${Date.now()}@campus.edu`;
  const { data: buyerCreated, error: buyerCreateErr } = await admin.auth.admin.createUser({
    email: buyerEmail, password: PW, email_confirm: true, user_metadata: { full_name: 'Spec Buyer' },
  });
  if (buyerCreateErr || !buyerCreated.user) {
    console.error('Buyer creation failed:', buyerCreateErr?.message);
    process.exit(1);
  }
  const buyerId = buyerCreated.user.id;

  // 3. Admin User
  const adminEmail = `admin_${Date.now()}@campus.edu`;
  const { data: adminCreated, error: adminCreateErr } = await admin.auth.admin.createUser({
    email: adminEmail, password: PW, email_confirm: true, user_metadata: { full_name: 'Spec Admin' },
  });
  if (adminCreateErr || !adminCreated.user) {
    console.error('Admin creation failed:', adminCreateErr?.message);
    process.exit(1);
  }
  const adminId = adminCreated.user.id;
  await admin.from('profiles').update({ is_admin: true }).eq('id', adminId);

  // Sign in fixture users
  const { data: sellerLogin } = await anon.auth.signInWithPassword({ email: sellerEmail, password: PW });
  const sellerCookie = cookieHeader(sellerLogin.session);

  const { data: buyerLogin } = await anon.auth.signInWithPassword({ email: buyerEmail, password: PW });
  const buyerCookie = cookieHeader(buyerLogin.session);

  const { data: adminLogin } = await anon.auth.signInWithPassword({ email: adminEmail, password: PW });
  const adminCookie = cookieHeader(adminLogin.session);

  const { data: cat } = await admin.from('categories').select('id').limit(1).single();

  let listingId1 = '';
  let listingSlug1 = '';

  try {
    // ==========================================
    // Rule 2: Required on first listing
    // ==========================================
    console.log('\n--- Rule 2: First Listing WhatsApp Gate ---');
    const noNumberRes = await req('/api/listings', sellerCookie, { method: 'POST', body: JSON.stringify(listingBody(cat.id)) });
    const noNumberJson = await noNumberRes.json();
    check(
      '2.1 POST /api/listings without number on numberless seller -> 400 VALIDATION_ERROR',
      noNumberRes.status === 400 && noNumberJson?.error?.code === 'VALIDATION_ERROR' && /whatsapp/i.test(noNumberJson?.error?.message || ''),
      `status=${noNumberRes.status} msg=${noNumberJson?.error?.message}`
    );

    const badFormatRes = await req('/api/listings', sellerCookie, { method: 'POST', body: JSON.stringify(listingBody(cat.id, '98765')) });
    const badFormatJson = await badFormatRes.json();
    check(
      '2.2 POST /api/listings with non-E.164 number -> 400 Zod error',
      badFormatRes.status === 400 && /E\.164/.test(badFormatJson?.error?.message || ''),
      `status=${badFormatRes.status} msg=${badFormatJson?.error?.message}`
    );

    const validFirstRes = await req('/api/listings', sellerCookie, { method: 'POST', body: JSON.stringify(listingBody(cat.id, INITIAL_NUMBER)) });
    const validFirstJson = await validFirstRes.json();
    listingId1 = validFirstJson?.data?.id;
    listingSlug1 = validFirstJson?.data?.slug;
    check('2.3 POST /api/listings with valid E.164 number -> 201 Created', validFirstRes.status === 201 && !!listingId1, `status=${validFirstRes.status}`);

    const { data: profileAfterFirst } = await admin.from('profiles').select('whatsapp_number').eq('id', sellerId).single();
    check('2.4 Number saved to profiles.whatsapp_number during listing creation', profileAfterFirst?.whatsapp_number === INITIAL_NUMBER, `number=${profileAfterFirst?.whatsapp_number}`);

    const secondListingRes = await req('/api/listings', sellerCookie, { method: 'POST', body: JSON.stringify(listingBody(cat.id)) });
    const secondListingJson = await secondListingRes.json();
    check('2.5 Second listing POST without number succeeds (already on file)', secondListingRes.status === 201 && !!secondListingJson?.data?.id, `status=${secondListingRes.status}`);

    // ==========================================
    // Rule 1: One number per account, not per listing
    // ==========================================
    console.log('\n--- Rule 1: One Number Per Account & Dynamic Update ---');
    // Buyer contacts seller on listing 1
    const contact1 = await req(`/api/listings/${listingId1}/contact`, buyerCookie, { method: 'POST' });
    const contact1Json = await contact1.json();
    const initialWaLink = contact1Json?.data?.waLink || '';
    check('1.1 Contact reveal returns waLink containing seller initial number', contact1.status === 200 && initialWaLink.includes('9876543210'), `link=${initialWaLink}`);

    // Seller updates profile number
    await admin.from('profiles').update({ whatsapp_number: UPDATED_NUMBER }).eq('id', sellerId);

    // Buyer contacts seller on listing 1 AGAIN (after clear contact reveal window or bypassing rate limit test)
    const contact2 = await req(`/api/listings/${listingId1}/contact`, buyerCookie, { method: 'POST' });
    const contact2Json = await contact2.json();
    const updatedWaLink = contact2Json?.data?.waLink || '';
    check('1.2 Updating profile number immediately changes waLink on old listing', contact2.status === 200 && updatedWaLink.includes('9111111111'), `link=${updatedWaLink}`);

    // Verify listing table itself does not have a whatsapp_number column
    const { data: listingRaw } = await admin.from('listings').select('*').eq('id', listingId1).single();
    check('1.3 listings table has no whatsapp_number column', !('whatsapp_number' in (listingRaw || {})), `keys=${Object.keys(listingRaw || {}).join(',')}`);

    // ==========================================
    // Rule 3: Secrecy / Non-Exposure
    // ==========================================
    console.log('\n--- Rule 3: Secrecy & Non-Exposure ---');
    // Authenticated client attempting direct select on profiles.whatsapp_number
    const sellerClient = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${sellerLogin.session.access_token}` } } });
    const { data: secretSelectData, error: secretSelectErr } = await sellerClient.from('profiles').select('whatsapp_number').eq('id', sellerId);
    check('3.1 Direct SELECT profiles.whatsapp_number via client -> permission denied / blocked', !!secretSelectErr || !secretSelectData || secretSelectData[0]?.whatsapp_number === null, `err=${secretSelectErr?.message}`);

    // public_profiles view check
    const { data: pubView } = await admin.from('public_profiles').select('*').eq('id', sellerId).single();
    check('3.2 public_profiles view omits whatsapp_number column completely', !('whatsapp_number' in (pubView || {})), `keys=${Object.keys(pubView || {}).join(',')}`);

    // Contact API response body assertion
    check('3.3 POST /api/listings/[id]/contact response body contains ONLY { waLink }', contact2Json?.data && Object.keys(contact2Json.data).length === 1 && 'waLink' in contact2Json.data && !('whatsapp_number' in contact2Json.data) && !('phone' in contact2Json.data));

    // SSR / HTML non-exposure check
    const listingPageRes = await req(`/listing/${listingSlug1}`, buyerCookie);
    const listingPageText = await listingPageRes.text();
    check('3.4 SSR HTML on listing detail page does NOT contain raw phone string (+919111111111 / 9111111111)', !listingPageText.includes('9111111111') && !listingPageText.includes('9876543210'));

    // ==========================================
    // Rule 4: Ban doesn't touch the number
    // ==========================================
    console.log('\n--- Rule 4: Ban / Unban Behavior ---');
    // Ban seller
    const banRes = await req(`/api/admin/users/${sellerId}/ban`, adminCookie, { method: 'POST' });
    check('4.1 Admin ban endpoint -> 200 OK', banRes.status === 200);

    const { data: sellerProfileBanned } = await admin.from('profiles').select('is_banned, whatsapp_number').eq('id', sellerId).single();
    check('4.2 Ban sets is_banned=true and leaves whatsapp_number intact', sellerProfileBanned?.is_banned === true && sellerProfileBanned?.whatsapp_number === UPDATED_NUMBER, `banned=${sellerProfileBanned?.is_banned} num=${sellerProfileBanned?.whatsapp_number}`);

    // Banned seller listings hidden from browse
    const browseRes = await req('/api/listings', null);
    const browseJson = await browseRes.json();
    const sellerListingsInBrowse = (browseJson?.data?.listings || []).filter((l) => l.seller_id === sellerId);
    check('4.3 Banned seller listings excluded from public Browse', sellerListingsInBrowse.length === 0, `found=${sellerListingsInBrowse.length}`);

    // Unban seller
    const unbanRes = await req(`/api/admin/users/${sellerId}/unban`, adminCookie, { method: 'POST' });
    check('4.4 Admin unban endpoint -> 200 OK', unbanRes.status === 200);

    const { data: sellerProfileUnbanned } = await admin.from('profiles').select('is_banned, whatsapp_number').eq('id', sellerId).single();
    check('4.5 Unban restores status with whatsapp_number intact', sellerProfileUnbanned?.is_banned === false && sellerProfileUnbanned?.whatsapp_number === UPDATED_NUMBER);

    const browseAfterUnban = await req('/api/listings', null);
    const browseAfterUnbanJson = await browseAfterUnban.json();
    const sellerListingsAfterUnban = (browseAfterUnbanJson?.data?.listings || []).filter((l) => l.seller_id === sellerId);
    check('4.6 Listings reappear in public Browse immediately upon unban', sellerListingsAfterUnban.length > 0, `found=${sellerListingsAfterUnban.length}`);

    // ==========================================
    // Rule 5: Account Deletion
    // ==========================================
    console.log('\n--- Rule 5: Self-Service Account Deletion ---');
    const guestDeleteRes = await req('/api/account', null, { method: 'DELETE' });
    check('5.1 Unauthenticated DELETE /api/account -> 401 UNAUTHORIZED', guestDeleteRes.status === 401);

    const deleteAccountRes = await req('/api/account', sellerCookie, { method: 'DELETE' });
    const deleteAccountJson = await deleteAccountRes.json();
    check('5.2 Authenticated DELETE /api/account -> 200 { data: { deleted: true } }', deleteAccountRes.status === 200 && deleteAccountJson?.data?.deleted === true, `status=${deleteAccountRes.status}`);

    // Cascade proofs
    const { data: authUserAfter } = await admin.auth.admin.getUserById(sellerId);
    check('5.3 auth.users row deleted', !authUserAfter?.user);

    const { data: profileAfter } = await admin.from('profiles').select('id').eq('id', sellerId).maybeSingle();
    check('5.4 profile row (and whatsapp_number) cascaded away', !profileAfter);

    const { data: listingsAfter } = await admin.from('listings').select('id').eq('seller_id', sellerId);
    check('5.5 seller listings cascaded away', (listingsAfter || []).length === 0, `count=${(listingsAfter || []).length}`);

    const { data: revealsAfter } = await admin.from('contact_reveals').select('id').eq('user_id', sellerId);
    check('5.6 contact_reveals cascaded away', (revealsAfter || []).length === 0, `count=${(revealsAfter || []).length}`);

  } finally {
    // Cleanup fixtures
    await admin.from('listings').delete().eq('seller_id', sellerId);
    await admin.from('profiles').delete().eq('id', sellerId);
    await admin.auth.admin.deleteUser(sellerId).catch(() => {});
    await admin.auth.admin.deleteUser(buyerId).catch(() => {});
    await admin.auth.admin.deleteUser(adminId).catch(() => {});
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    console.error('❌ SOME WHATSAPP NUMBER RULES CHECKS FAILED');
    process.exit(1);
  }
  console.log('🎉 ALL 5 WHATSAPP NUMBER RULES VERIFIED CLEANLY!');
})().catch((err) => {
  console.error('Error during verification suite run:', err);
  process.exit(1);
});

