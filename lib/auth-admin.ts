import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function requireAdminSession() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      isAdmin: false,
      response: NextResponse.json(
        { error: { message: 'You must be signed in as an admin.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      ),
    };
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_admin, is_banned')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin || profile?.is_banned) {
    return {
      user,
      isAdmin: false,
      response: NextResponse.json(
        { error: { message: 'Admin permissions required.', code: 'FORBIDDEN' } },
        { status: 403 }
      ),
    };
  }

  return { user, isAdmin: true, response: null };
}
