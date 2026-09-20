import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { updateListingSchema } from '@/lib/validation/listing';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/listings/[id] — Edit a listing.
 * Spec: TRD §5.7
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const supabase = await createServerClient();

    // Verify session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'You must be signed in to edit this listing.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Validate body
    const body = await request.json();
    const parseResult = updateListingSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid listing data';
      return NextResponse.json(
        { error: { message: firstError, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    // Never allow updating seller_id, slug, views, or status through this endpoint (rules.md §3)
    const updateData = {
      ...parseResult.data,
      updated_at: new Date().toISOString(),
    };

    // RLS listings_update_own or listings_update_admin controls access
    const { data: updatedListing, error: updateError } = await supabase.from('listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116' || updateError.message.includes('No rows found')) {
        return NextResponse.json(
          { error: { message: 'Listing not found or you do not have permission to edit it.', code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }

      console.error('Listing update failed', updateError);
      return NextResponse.json(
        { error: { message: 'Could not update this listing. Please try again.', code: 'UPDATE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedListing });
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to update listing. Please try again.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/listings/[id] — Delete a listing.
 * Spec: TRD §5.7
 */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = params;
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'You must be signed in to delete this listing.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // RLS listings_delete_own or listings_delete_admin controls access
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Listing deletion failed', deleteError);
      return NextResponse.json(
        { error: { message: 'Could not delete this listing. Please try again.', code: 'DELETE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to delete listing. Please try again.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
