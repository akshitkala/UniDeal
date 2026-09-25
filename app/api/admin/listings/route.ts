import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/admin/listings — Fetch all listings for Admin Listings view.
 * Supports status filter and search query.
 */
export async function GET(request: NextRequest) {
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const searchQuery = searchParams.get('search');

  try {
    const adminClient = createAdminClient();
    let query = adminClient
      .from('listings')
      .select('id, slug, title, description, price, negotiable, condition, images, status, rejection_reason, created_at, categories(name), public_profiles(full_name)')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter as 'approved' | 'pending' | 'rejected' | 'sold');
    }

    if (searchQuery && searchQuery.trim()) {
      query = query.ilike('title', `%${searchQuery.trim()}%`);
    }

    const { data: listings, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: { message: 'Failed to fetch admin listings.', code: 'FETCH_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { listings: listings || [] } });
  } catch {
    return NextResponse.json(
      { error: { message: 'An unexpected error occurred.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
