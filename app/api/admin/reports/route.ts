import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPendingReports } from '@/lib/admin/queries';
/**
 * GET /api/admin/reports — List pending reports for admin review.
 * Spec: TRD §5.8
 */
export async function GET() {
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const { data: reports, error } = await getPendingReports();

  if (error) {
    return NextResponse.json(
      { error: { message: `Failed to fetch reports: ${error.message}`, code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { reports } });
}
