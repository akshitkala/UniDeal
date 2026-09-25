import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

interface BulkRejectRequestBody {
  listing_ids?: string[];
  reason?: string;
}

/**
 * PATCH /api/admin/listings/bulk-reject — Admin bulk rejection endpoint.
 * Accepts { listing_ids: string[], reason: string }.
 * Re-checks is_admin server-side. Fails closed on malformed requests.
 * Handles partial failures cleanly (skips sold/rejected/missing listings).
 * Leaves open reports untouched for human review.
 */
export async function PATCH(request: NextRequest) {
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  try {
    const body: BulkRejectRequestBody = await request.json().catch(() => ({}));

    const { listing_ids, reason } = body;

    // Fail closed validation
    if (
      !Array.isArray(listing_ids) ||
      listing_ids.length === 0 ||
      typeof reason !== 'string' ||
      !reason.trim()
    ) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid request body. Expected non-empty listing_ids array and a non-empty reason string.',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const trimmedReason = reason.trim();
    const adminClient = createAdminClient();

    const rejected: string[] = [];
    const skipped: { id: string; reason: string }[] = [];

    for (const id of listing_ids) {
      if (typeof id !== 'string' || !id.trim()) {
        skipped.push({ id: String(id), reason: 'Invalid listing ID format' });
        continue;
      }

      // Check current listing status
      const { data: listing, error: fetchError } = await adminClient
        .from('listings')
        .select('id, status')
        .eq('id', id)
        .single();

      if (fetchError || !listing) {
        skipped.push({ id, reason: 'Listing not found' });
        continue;
      }

      if (listing.status === 'sold') {
        skipped.push({ id, reason: 'Listing is already sold' });
        continue;
      }

      if (listing.status === 'rejected') {
        skipped.push({ id, reason: 'Listing is already rejected' });
        continue;
      }

      // Execute single rejection update
      const { error: updateError } = await adminClient
        .from('listings')
        .update({
          status: 'rejected',
          rejection_reason: trimmedReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        skipped.push({ id, reason: 'Database update failed' });
      } else {
        rejected.push(id);
      }
    }

    return NextResponse.json({
      data: {
        rejected,
        skipped,
      },
    });
  } catch {
    return NextResponse.json(
      { error: { message: 'An unexpected error occurred during bulk rejection.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
