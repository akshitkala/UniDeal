import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/listings/pending — Get manual-mode pending queue.
 * Spec: TRD §5.9
 */
export async function GET() {
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const adminClient = createAdminClient();
  const { data: listings, error } = await adminClient
    .from('listings')
    .select(`
      id,
      slug,
      title,
      description,
      price,
      negotiable,
      condition,
      images,
      status,
      created_at,
      categories!inner(id, name, slug),
      public_profiles!inner(id, full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: { message: `Failed to fetch pending listings: ${error.message}`, code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { listings: listings || [] } });
}
