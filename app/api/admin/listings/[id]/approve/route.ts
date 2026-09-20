import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: { id: string };
}

/**
 * PATCH /api/admin/listings/[id]/approve — Approve a pending listing.
 * Spec: TRD §5.9
 */
export async function PATCH(_request: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const adminClient = createAdminClient();
  const { data: updated, error } = await adminClient
    .from('listings')
    .update({
      status: 'approved',
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: { message: 'Listing not found or approval failed.', code: 'APPROVE_ERROR' } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: updated });
}
