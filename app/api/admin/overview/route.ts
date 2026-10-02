import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/overview — snapshot counts for the Admin Overview cards.
 * Spec: design (2).md §7.12 / QA-03 (pending listings, open reports, total users).
 */
export async function GET() {
  const isTrace = process.env.PERF_TRACE === '1';
  const t0 = isTrace ? performance.now() : 0;

  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const tSession = isTrace ? performance.now() : 0;

  const adminClient = createAdminClient();
  const [pending, reports, users] = await Promise.all([
    adminClient.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const tQuery = isTrace ? performance.now() : 0;
  if (isTrace) {
    console.log(`[PERF_TRACE] GET /api/admin/overview: session=${(tSession - t0).toFixed(2)}ms, parallelQueries=${(tQuery - tSession).toFixed(2)}ms, total=${(tQuery - t0).toFixed(2)}ms`);
  }

  if (pending.error || reports.error || users.error) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch overview counts.', code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }

  const res = NextResponse.json({
    data: {
      pending_listings: pending.count ?? 0,
      open_reports: reports.count ?? 0,
      total_users: users.count ?? 0,
    },
  });
  if (isTrace) {
    res.headers.set('x-perf-handler-ms', (performance.now() - t0).toFixed(2));
  }
  return res;
}
