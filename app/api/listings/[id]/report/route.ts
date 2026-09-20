import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

interface RouteContext {
  params: { id: string };
}

const validReportReasons = [
  'Fake listing',
  'Prohibited item',
  'Misleading price',
  'Spam',
  'Other',
] as const;

const reportSchema = z.object({
  reason: z.enum(validReportReasons, {
    errorMap: () => ({ message: 'Please select a valid report reason.' }),
  }),
});

/**
 * POST /api/listings/[id]/report — File a report for a listing.
 * Spec: TRD §5.8
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: listingId } = params;
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'You must be signed in to report a listing.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = reportSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid report reason';
      return NextResponse.json(
        { error: { message: firstError, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const { reason } = parseResult.data;

    // RLS policy reports_insert_own enforces reporter_id = auth.uid()
    const { data: newReport, error: insertError } = await supabase
      .from('reports')
      .insert({
        listing_id: listingId,
        reporter_id: user.id,
        reason,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      // Duplicate constraint unique(listing_id, reporter_id)
      if (insertError.code === '23505' || insertError.message.includes('unique')) {
        return NextResponse.json(
          { error: { message: "You've already reported this listing.", code: 'DUPLICATE_REPORT' } },
          { status: 409 }
        );
      }

      console.error('[report] insert error:', insertError);
      return NextResponse.json(
        { error: { message: 'Could not submit your report. Please try again.', code: 'INSERT_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newReport }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to submit report. Please try again.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
