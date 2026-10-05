import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPendingListings } from '@/lib/admin/queries';
/**
 * GET /api/admin/listings/pending — Get manual-mode pending queue.
 * Spec: TRD §5.9
 */
export async function GET() {
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const { data: listings, error } = await getPendingListings();

  if (error) {
    return NextResponse.json(
      { error: { message: `Failed to fetch pending listings: ${error.message}`, code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { listings } });
}
