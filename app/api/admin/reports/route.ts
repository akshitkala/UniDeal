import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/reports — List pending reports for admin review.
 * Spec: TRD §5.8
 */
export async function GET() {
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const adminClient = createAdminClient();
  const { data: reports, error } = await adminClient
    .from('reports')
    .select(`
      id,
      reason,
      status,
      created_at,
      listings!inner(id, title, slug, price, status, images),
      public_profiles!reports_reporter_id_fkey(id, full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: { message: `Failed to fetch reports: ${error.message}`, code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { reports: reports || [] } });
}
