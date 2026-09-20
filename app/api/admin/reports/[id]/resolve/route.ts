import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

interface RouteContext {
  params: { id: string };
}

const resolveReportSchema = z.object({
  action: z.enum(['remove', 'dismiss'], {
    errorMap: () => ({ message: 'Action must be "remove" or "dismiss".' }),
  }),
});

/**
 * PATCH /api/admin/reports/[id]/resolve — Resolve a reported listing.
 * Spec: TRD §5.8
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id: reportId } = params;
  const { user, isAdmin, response } = await requireAdminSession();
  if (!isAdmin || !user) return response!;

  try {
    const body = await request.json();
    const parseResult = resolveReportSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid resolve action';
      return NextResponse.json(
        { error: { message: firstError, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const { action } = parseResult.data;
    const adminClient = createAdminClient();

    // Fetch target report
    const { data: report, error: fetchErr } = await adminClient
      .from('reports')
      .select('id, listing_id, status')
      .eq('id', reportId)
      .single();

    if (fetchErr || !report) {
      return NextResponse.json(
        { error: { message: 'Report not found.', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();

    if (action === 'remove') {
      // 1. Mark listing as rejected with rejection reason
      await adminClient
        .from('listings')
        .update({
          status: 'rejected',
          rejection_reason: 'Removed due to community report',
          updated_at: now,
        })
        .eq('id', report.listing_id);

      // 2. Mark report as resolved_removed
      const { data: updatedReport, error: updateErr } = await adminClient
        .from('reports')
        .update({
          status: 'resolved_removed',
          resolved_by: user.id,
          resolved_at: now,
        })
        .eq('id', reportId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json(
          { error: { message: 'Failed to resolve report.', code: 'UPDATE_ERROR' } },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: updatedReport });
    } else {
      // Action: dismiss -> keep listing intact, mark report as resolved_dismissed
      const { data: updatedReport, error: updateErr } = await adminClient
        .from('reports')
        .update({
          status: 'resolved_dismissed',
          resolved_by: user.id,
          resolved_at: now,
        })
        .eq('id', reportId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json(
          { error: { message: 'Failed to resolve report.', code: 'UPDATE_ERROR' } },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: updatedReport });
    }
  } catch {
    return NextResponse.json(
      { error: { message: 'An error occurred while resolving the report.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
