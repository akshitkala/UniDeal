import { signAccessToken } from '../lib/auth/jwt';
import { connectDB } from '../lib/db/connect';
import { User } from '../models/User';
import { Listing } from '../models/Listing';
import { Category } from '../models/Category';

const BASE_URL = 'http://localhost:3000';

// Test results tracking
const results: { pass: number; fail: number; failures: string[] } = {
    pass: 0, fail: 0, failures: [],
};

function pass(label: string) {
    results.pass++;
    console.log(`✅ PASS — ${label}`);
}

function fail(label: string, detail: string) {
    results.fail++;
    results.failures.push(`${label}: ${detail}`);
    console.log(`❌ FAIL — ${label} — ${detail}`);
}

async function check(label: string, fn: () => Promise<void>) {
    try {
        await fn();
    } catch (e: any) {
        fail(label, e.message);
    }
}

async function expectStatus(
    label: string,
    url: string,
    options: RequestInit,
    expectedStatus: number | number[]
) {
    try {
        const fullUrl = `${BASE_URL}${url}`;
        const res = await fetch(fullUrl, options);
        const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];

        if (expected.includes(res.status)) {
            pass(label);
        } else {
            const body = await res.text().catch(() => 'no body');
            fail(label, `URL: ${url} | Expected ${expected.join('/')}, got ${res.status} | Body: ${body.substring(0, 100)}`);
        }
    } catch (e: any) {
        fail(label, `Fetch error: ${e.message}`);
    }
}

async function makeToken(role: 'user' | 'admin' | 'superadmin', suffix: string = '') {
    const email = `test-${role}${suffix ? '-' + suffix : ''}@unideal-test.com`;
    const uid = `test-${role}${suffix ? '-' + suffix : ''}-uid`;

    // Find or create test user with this role
    let user = await User.findOne({ email });
    if (!user) {
        user = await User.create({
            uid,
            email,
            displayName: `Test ${role} ${suffix}`,
            role,
            isActive: true,
            emailVerified: true,
        });
    } else {
        user.role = role;
        user.isActive = true;
        await user.save();
    }

    const token = signAccessToken({
        uid: user.uid,
        email: user.email,
        role: user.role,
        emailVerified: true,
    });

    if (!token) throw new Error(`Token generation failed for ${role}`);

    return { token, user };
}

async function runTests() {
    console.log('\n🔐 UniDeal Security Test Suite\n');
    console.log('='.repeat(50));

    try {
        await connectDB();
        console.log('Connected to MongoDB.');
    } catch (e: any) {
        console.error('Failed to connect to DB:', e.message);
        process.exit(1);
    }

    // Generate tokens
    console.log('\n📋 Generating test tokens...');
    const { token: userToken, user: userA } = await makeToken('user', 'a');
    const { token: adminToken } = await makeToken('admin');
    const { token: superadminToken } = await makeToken('superadmin');

    // Get a real listing slug for testing
    const testListing = await Listing.findOne({ isDeleted: false });
    const slug = testListing?.slug ?? 'nonexistent-slug';

    console.log(`Using listing slug: ${slug}`);

    // ── PART 1: API Route Protection ────────────────────
    console.log('\n\nPART 1 — API ROUTE PROTECTION (no token → expect 401)\n');

    await expectStatus('POST /api/listings no token', '/api/listings', { method: 'POST' }, 401);
    await expectStatus('PATCH /api/listings/[slug] no token', `/api/listings/${slug}`, { method: 'PATCH' }, 401);
    await expectStatus('DELETE /api/listings/[slug] no token', `/api/listings/${slug}`, { method: 'DELETE' }, 401);
    await expectStatus('POST /api/listings/[slug]/contact no token', `/api/listings/${slug}/contact`, { method: 'POST' }, 401);
    await expectStatus('POST /api/listings/[slug]/save no token', `/api/listings/${slug}/save`, { method: 'POST' }, 401);
    await expectStatus('GET /api/users/profile no token', '/api/users/profile', { method: 'GET' }, 401);
    await expectStatus('PATCH /api/users/profile no token', '/api/users/profile', { method: 'PATCH' }, 401);
    await expectStatus('GET /api/admin/listings no token', '/api/admin/listings', { method: 'GET' }, 401);
    await expectStatus('GET /api/admin/users no token', '/api/admin/users', { method: 'GET' }, 401);
    await expectStatus('GET /api/super-admin/stats no token', '/api/super-admin/stats', { method: 'GET' }, 401);
    await expectStatus('GET /api/super-admin/activity no token', '/api/super-admin/activity', { method: 'GET' }, 401);
    await expectStatus('PATCH /api/super-admin/config no token', '/api/super-admin/config', { method: 'PATCH' }, 401);

    // Cron protection (using GET as required by route)
    await expectStatus('GET /api/cron/expire-listings no token → 401', '/api/cron/expire-listings', { method: 'GET' }, 401);

    // ── PART 2: Role Escalation ─────────────────────────
    console.log('\n\nPART 2 — ROLE ESCALATION (user token → admin routes → expect 403)\n');

    const userHeaders = { 'Cookie': `access_token=${userToken}` };

    await expectStatus('User → GET /api/admin/listings', '/api/admin/listings', { method: 'GET', headers: userHeaders }, 403);
    await expectStatus('User → GET /api/admin/users', '/api/admin/users', { method: 'GET', headers: userHeaders }, 403);
    await expectStatus('User → PATCH /api/admin/users/[uid]', `/api/admin/users/${userA.uid}`, { method: 'PATCH', headers: userHeaders }, 403);
    await expectStatus('User → GET /api/super-admin/stats', '/api/super-admin/stats', { method: 'GET', headers: userHeaders }, 403);
    await expectStatus('User → GET /api/super-admin/activity', '/api/super-admin/activity', { method: 'GET', headers: userHeaders }, 403);
    await expectStatus('User → PATCH /api/super-admin/config', '/api/super-admin/config', { method: 'PATCH', headers: userHeaders }, 403);

    console.log('\n--- Admin token → superadmin routes → expect 403 ---\n');

    const adminHeaders = { 'Cookie': `access_token=${adminToken}` };

    await expectStatus('Admin → GET /api/super-admin/stats', '/api/super-admin/stats', { method: 'GET', headers: adminHeaders }, 403);
    await expectStatus('Admin → PATCH /api/super-admin/config', '/api/super-admin/config', { method: 'PATCH', headers: adminHeaders }, 403);
    await expectStatus('Admin → GET /api/super-admin/activity', '/api/super-admin/activity', { method: 'GET', headers: adminHeaders }, 403);

    // ── PART 3: Ownership checks ─────────────────────────
    console.log('\n\nPART 3 — OWNERSHIP ATTACKS\n');

    // Create a listing for User B
    const { token: userBToken, user: userB } = await makeToken('user', 'b');

    let category = await Category.findOne();
    if (!category) {
        category = await Category.create({ name: 'Test', slug: 'test', icon: 'test', order: 1 });
    }

    const listingByB = await Listing.create({
        title: 'User B Laptop',
        description: 'Laptop for sale',
        price: 15000,
        condition: 'good',
        category: category._id,
        seller: userB._id,
        slug: 'user-b-laptop-' + Date.now(),
        status: 'approved',
        images: ['https://placehold.co/600x400'],
    });

    if (listingByB) {
        await expectStatus(
            'User A editing User B listing → expect 403',
            `/api/listings/${listingByB.slug}`,
            {
                method: 'PATCH',
                headers: { 'Cookie': `access_token=${userToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Hacked Title' }),
            },
            403
        );

        await expectStatus(
            'User B editing own listing → expect 200',
            `/api/listings/${listingByB.slug}`,
            {
                method: 'PATCH',
                headers: { 'Cookie': `access_token=${userBToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'New Valid Title' }),
            },
            200
        );
    }

    // Admin trying to edit listing content → expect 403
    await expectStatus(
        'Admin editing listing content → expect 403',
        `/api/listings/${slug}`,
        {
            method: 'PATCH',
            headers: { 'Cookie': `access_token=${adminToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Admin Hacked Title' }),
        },
        403
    );

    // ── PART 4: Sensitive data exposure ──────────────────
    console.log('\n\nPART 4 — SENSITIVE DATA EXPOSURE\n');

    await check('GET /api/listings — no sensitive fields', async () => {
        const res = await fetch(`${BASE_URL}/api/listings`);
        const data = await res.json();
        const listings = data.listings ?? data ?? [];
        const sensitiveFields = ['sellerPhone', 'sellerEmail', 'sellerWhatsapp', 'password'];

        for (const listing of listings) {
            for (const field of sensitiveFields) {
                if (listing[field] !== undefined) {
                    fail(`Listings list exposes ${field}`, `Found in listing ${listing._id}`);
                    return;
                }
            }
        }
        pass('GET /api/listings — no sensitive fields exposed');
    });

    await check(`GET /api/listings/${slug} — no sensitive fields`, async () => {
        const res = await fetch(`${BASE_URL}/api/listings/${slug}`);
        const data = await res.json();
        const listing = data.listing ?? data;
        const sensitiveFields = ['sellerPhone', 'sellerEmail', 'sellerWhatsapp', 'password'];

        for (const field of sensitiveFields) {
            if (listing[field] !== undefined) {
                fail(`Single listing exposes ${field}`, `Found in listing ${slug}`);
                return;
            }
        }
        pass(`GET /api/listings/${slug} — no sensitive fields exposed`);
    });

    // ── PART 5: Input validation ──────────────────────────
    console.log('\n\nPART 5 — INPUT VALIDATION\n');

    await expectStatus(
        'POST /api/listings — no title → 400',
        '/api/listings',
        {
            method: 'POST',
            headers: { 'Cookie': `access_token=${userToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: 100, condition: 'good' })
        },
        400
    );

    await expectStatus(
        'POST /api/listings — no price → 400',
        '/api/listings',
        {
            method: 'POST',
            headers: { 'Cookie': `access_token=${userToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test', condition: 'good' })
        },
        400
    );

    await expectStatus(
        'POST /api/listings — negative price → 400',
        '/api/listings',
        {
            method: 'POST',
            headers: { 'Cookie': `access_token=${userToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test', price: -100, condition: 'good' })
        },
        400
    );

    await expectStatus(
        'POST /api/listings — no whatsapp → 400',
        '/api/listings',
        {
            method: 'POST',
            headers: { 'Cookie': `access_token=${userToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test', price: 100, condition: 'good', category: 'books' })
        },
        400
    );

    // ── PART 6: Cron protection ───────────────────────────
    console.log('\n\nPART 6 — CRON ENDPOINT PROTECTION\n');

    await expectStatus(
        'GET /api/cron/expire-listings — no secret → 401',
        '/api/cron/expire-listings',
        { method: 'GET' },
        401
    );

    await expectStatus(
        'GET /api/cron/expire-listings — wrong secret → 401',
        '/api/cron/expire-listings',
        { method: 'GET', headers: { 'x-cron-secret': 'wrong-secret' } },
        401
    );

    // ── PART 7: Banned user ───────────────────────────────
    console.log('\n\nPART 7 — BANNED USER CHECKS\n');

    // Ban userA
    await User.findOneAndUpdate({ uid: userA.uid }, { isActive: false });

    await expectStatus(
        'Banned user → POST /api/listings/[slug]/contact → 403',
        `/api/listings/${slug}/contact`,
        { method: 'POST', headers: { 'Cookie': `access_token=${userToken}` } },
        403
    );

    await expectStatus(
        'Banned user → POST /api/listings/[slug]/save → 403',
        `/api/listings/${slug}/save`,
        { method: 'POST', headers: { 'Cookie': `access_token=${userToken}` } },
        403
    );

    // Unban userA
    await User.findOneAndUpdate({ uid: userA.uid }, { isActive: true });

    await expectStatus(
        'Unbanned user → POST /api/listings/[slug]/save → 200 or 201',
        `/api/listings/${slug}/save`,
        { method: 'POST', headers: { 'Cookie': `access_token=${userToken}` } },
        [200, 201]
    );

    // ── SUMMARY ──────────────────────────────────────────
    console.log('\n\n' + '='.repeat(50));
    console.log('🔐 SECURITY TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total:  ${results.pass + results.fail}`);
    console.log(`✅ Passed: ${results.pass}`);
    console.log(`❌ Failed: ${results.fail}`);
    console.log(`Pass rate: ${Math.round((results.pass / (results.pass + results.fail)) * 100)}%`);

    if (results.failures.length > 0) {
        console.log('\n🚨 FAILURES:');
        results.failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    } else {
        console.log('\n🎉 All security checks passed!');
    }

    // Clean up test users
    await User.deleteMany({ email: { $regex: '@unideal-test.com' } });
    process.exit(results.fail > 0 ? 1 : 0);
}

runTests().catch(e => {
    console.error('Fatal Test Error:', e);
    process.exit(1);
});
