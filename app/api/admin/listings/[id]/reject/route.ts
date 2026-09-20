import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

interface RouteContext {
  params: { id: string };
}

const rejectSchema = z.object({
  reason: z.string().trim().min(3, 'Rejection reason must be at least 3 characters'),
});

/**
 * PATCH /api/admin/listings/[id]/reject — Reject a listing with a reason.
 * Spec: TRD §5.9
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = params;
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  try {
    const body = await request.json();
    const parseResult = rejectSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid rejection reason';
      return NextResponse.json(
        { error: { message: firstError, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const { reason } = parseResult.data;
    const adminClient = createAdminClient();

    const { data: updated, error } = await adminClient
      .from('listings')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: { message: 'Listing not found or rejection failed.', code: 'REJECT_ERROR' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json(
      { error: { message: 'An error occurred while rejecting the listing.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
