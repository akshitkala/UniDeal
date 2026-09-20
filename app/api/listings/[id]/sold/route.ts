import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/listings/[id]/sold — Mark a listing as sold.
 * Spec: TRD §5.6
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id: listingId } = params;
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'You must be signed in to mark a listing as sold.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // RLS policy listings_update_own ensures only the seller can mark their listing as sold
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update({
        status: 'sold',
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .eq('seller_id', user.id)
      .select()
      .single();

    if (updateError || !updatedListing) {
      return NextResponse.json(
        { error: { message: 'Listing not found or you do not have permission to mark it as sold.', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedListing });
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to mark listing as sold. Please try again.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
