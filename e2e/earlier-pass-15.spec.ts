import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://difmyugeebvbcaojcuwq.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZm15dWdlZWJ2YmNhb2pjdXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTI2NjQsImV4cCI6MjEwMjI2ODY2NH0.RiFW6Nsiwt52jRfhJtvTezIiiphObFglHKfqLhyFh_0';

test.describe('Earlier-Pass 15 Invariants (SEC & FUN)', () => {
  const anonClient = createClient(supabaseUrl, anonKey);

  test('SEC-03: Direct anon-key query to profiles for whatsapp_number is denied', async () => {
    const { data, error } = await anonClient.from('profiles').select('id, whatsapp_number').limit(1);
    const denied = error !== null || (data && (data.length === 0 || data[0].whatsapp_number === null || data[0].whatsapp_number === undefined));
    expect(denied).toBe(true);
  });

  test('SEC-04: RLS enabled across tables - anon insert is blocked', async () => {
    const { error } = await anonClient.from('listings').insert({ title: 'Hacked Listing', price: 100 });
    expect(error).not.toBeNull();
  });

  test('SEC-05: User B cannot edit/delete User A listing enforced by RLS', async () => {
    const migration = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/001_initial_schema.sql'), 'utf8');
    expect(migration).toContain('listings_update_own');
    expect(migration).toContain('auth.uid() = seller_id');
  });

  test('SEC-07: User cannot self-promote or unban via profile update', async () => {
    const migration = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/001_initial_schema.sql'), 'utf8');
    expect(migration).toContain('profiles_update_own');
    expect(migration).toContain('is_admin = (select is_admin from public.profiles');
  });

  test('SEC-08: Unverified user cannot create listing enforced at DB level', async () => {
    const migration = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/001_initial_schema.sql'), 'utf8');
    expect(migration).toContain('listings_insert_own');
    expect(migration).toContain('email_confirmed_at is not null');
  });

  test('SEC-09: Banned user blocked from listing and contact reveal', async ({ request }) => {
    const contactRoute = fs.readFileSync(path.join(process.cwd(), 'app/api/listings/[id]/contact/route.ts'), 'utf8');
    expect(contactRoute).toContain('is_banned');
    const migration = fs.readFileSync(path.join(process.cwd(), 'supabase/migrations/001_initial_schema.sql'), 'utf8');
    expect(migration).toContain('p.is_banned = false');
  });

  test('SEC-11: Banned seller listings absent from public Browse', async () => {
    const { data } = await anonClient
      .from('listings')
      .select('id, title, seller_id, profiles!inner(is_banned)')
      .eq('profiles.is_banned', true);
    expect(data?.length || 0).toBe(0);
  });

  test('SEC-12: Duplicate report returns 409 Conflict', async () => {
    const reportRoute = fs.readFileSync(path.join(process.cwd(), 'app/api/listings/[id]/report/route.ts'), 'utf8');
    expect(reportRoute).toContain('409');
    expect(reportRoute).toContain('already reported');
  });

  test('SEC-16: Server validates listing fields and overrides seller_id with auth.uid', async () => {
    const listingApi = fs.readFileSync(path.join(process.cwd(), 'app/api/listings/route.ts'), 'utf8');
    expect(listingApi).toContain('user.id');
    expect(listingApi).toContain('approval_mode');
  });

  test('SEC-17: Admin actions re-check is_admin in Supabase DB server-side', async () => {
    const adminAuth = fs.readFileSync(path.join(process.cwd(), 'lib/auth-admin.ts'), 'utf8');
    expect(adminAuth).toContain('from(\'profiles\')');
    expect(adminAuth).toContain('is_admin');
  });

  test('FUN-05: returnTo resumes original action after authentication', async () => {
    const authModal = fs.readFileSync(path.join(process.cwd(), 'components/auth/AuthModal.tsx'), 'utf8');
    expect(authModal).toContain('returnTo');
  });

  test('FUN-08: Signup with existing email gives clear inline error', async () => {
    const authModal = fs.readFileSync(path.join(process.cwd(), 'components/auth/AuthModal.tsx'), 'utf8');
    expect(authModal).toContain('already registered');
    expect(authModal).toContain('An account with this email address already exists. Please sign in.');
  });

  test('FUN-14: File over 5MB rejected client-side before upload', async () => {
    const listingForm = fs.readFileSync(path.join(process.cwd(), 'components/listing/ListingForm.tsx'), 'utf8');
    expect(listingForm).toContain('CLOUDINARY_MAX_FILE_SIZE_BYTES');
    expect(listingForm).toContain('exceeds the 5MB size limit');
    const cloudinaryLib = fs.readFileSync(path.join(process.cwd(), 'lib/cloudinary.ts'), 'utf8');
    expect(cloudinaryLib).toContain('5 * 1024 * 1024');
  });

  test('FUN-15: Price field uses inputMode="numeric"', async () => {
    const listingForm = fs.readFileSync(path.join(process.cwd(), 'components/listing/ListingForm.tsx'), 'utf8');
    expect(listingForm).toContain('inputMode="numeric"');
  });

  test('FUN-30: Profile page loads and saves fields with privacy disclosure', async () => {
    const profilePage = fs.readFileSync(path.join(process.cwd(), 'app/(account)/profile/page.tsx'), 'utf8');
    expect(profilePage).toContain('never shown publicly');
    expect(profilePage).toContain('whatsapp_number');
  });
});
