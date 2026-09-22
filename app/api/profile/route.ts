import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/profile — the signed-in user's own profile.
 *
 * QA-02: `profiles.whatsapp_number` is REVOKE'd from anon+authenticated
 * (migration §4), so a client-side select silently returns null. The owner
 * reads it here instead: authenticated session -> service-role lookup scoped
 * to auth.uid() === profile id (rules.md §3 — service-role stays server-side,
 * the number is only ever returned to its own owner).
 */
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: { message: 'You must be signed in.', code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const adminClient = createAdminClient();
  const { data: profile, error } = await adminClient
    .from('profiles')
    .select('full_name, branch, year, whatsapp_number')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { error: { message: 'Profile not found.', code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: profile });
}
