import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import { getAdminSettings } from '@/lib/admin/queries';

const updateSettingsSchema = z.object({
  approval_mode: z.enum(['auto', 'manual'], {
    errorMap: () => ({ message: 'Approval mode must be "auto" or "manual".' }),
  }),
});

/**
 * GET /api/admin/settings — Fetch admin settings.
 * Spec: TRD §5.9
 */
export async function GET() {
  const isTrace = process.env.PERF_TRACE === '1';
  const t0 = isTrace ? performance.now() : 0;

  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const tSession = isTrace ? performance.now() : 0;

  const { data, error } = await getAdminSettings();

  const tQuery = isTrace ? performance.now() : 0;
  if (isTrace) {
    console.log(`[PERF_TRACE] GET /api/admin/settings: session=${(tSession - t0).toFixed(2)}ms, query=${(tQuery - tSession).toFixed(2)}ms, total=${(tQuery - t0).toFixed(2)}ms`);
  }

  if (error || !data) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch admin settings.', code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ data });
  if (isTrace) {
    res.headers.set('x-perf-handler-ms', (performance.now() - t0).toFixed(2));
  }
  return res;
}

/**
 * PATCH /api/admin/settings — Update admin settings (approval_mode).
 * Spec: TRD §5.9
 */
export async function PATCH(request: NextRequest) {
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  try {
    const body = await request.json();
    const parseResult = updateSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Invalid settings';
      return NextResponse.json(
        { error: { message: firstError, code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }

    const { approval_mode } = parseResult.data;
    const adminClient = createAdminClient();

    const { data: updated, error } = await adminClient
      .from('admin_settings')
      .update({ approval_mode })
      .eq('id', 1)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: { message: 'Failed to update admin settings.', code: 'UPDATE_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json(
      { error: { message: 'An error occurred while updating settings.', code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
