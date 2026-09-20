import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/admin/users/[id]/ban — Ban a user account.
 * Spec: TRD §5.10
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  const { id: targetUserId } = params;
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const adminClient = createAdminClient();
  const { data: updated, error } = await adminClient
    .from('profiles')
    .update({
      is_banned: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', targetUserId)
    .select('id, full_name, is_admin, is_banned')
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: { message: 'User profile not found or ban failed.', code: 'BAN_ERROR' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: updated });
}
