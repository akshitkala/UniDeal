import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/admin/users/[id]/promote — Promote a user to Admin.
 * Spec: TRD §5.10
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  const { id: targetUserId } = params;
  const { user, isAdmin, response } = await requireAdminSession();
  if (!isAdmin || !user) return response!;

  const adminClient = createAdminClient();
  const now = new Date().toISOString();

  const { data: updated, error } = await adminClient
    .from('profiles')
    .update({
      is_admin: true,
      promoted_by: user.id,
      promoted_at: now,
      updated_at: now,
    })
    .eq('id', targetUserId)
    .select('id, full_name, is_admin, is_banned, promoted_by, promoted_at')
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: { message: 'User profile not found or promotion failed.', code: 'PROMOTE_ERROR' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: updated });
}
