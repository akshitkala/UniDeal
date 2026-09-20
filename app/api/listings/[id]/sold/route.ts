import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * POST /api/listings/[id]/sold — Mark a listing as sold.
 * Spec: TRD §5.6
 */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'You must be signed in to mark this listing as sold.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { data: updatedListing, error: updateError } = await supabase.from('listings')
      .update({
        status: 'sold',
        sold_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('seller_id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: { message: 'Could not mark listing as sold. Verify ownership and try again.', code: 'UPDATE_ERROR' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: updatedListing });
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to update listing status.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
