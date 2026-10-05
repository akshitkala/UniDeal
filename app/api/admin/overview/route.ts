import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminOverview } from '@/lib/admin/queries';

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

  const { data, error } = await getAdminOverview();

  const tQuery = isTrace ? performance.now() : 0;
  if (isTrace) {
    console.log(`[PERF_TRACE] GET /api/admin/overview: session=${(tSession - t0).toFixed(2)}ms, parallelQueries=${(tQuery - tSession).toFixed(2)}ms, total=${(tQuery - t0).toFixed(2)}ms`);
  }

  if (error || !data) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch overview counts.', code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ data });
  if (isTrace) {
    res.headers.set('x-perf-handler-ms', (performance.now() - t0).toFixed(2));
  }
  return res;
}
