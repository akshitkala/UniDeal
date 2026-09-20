import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

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
  const { isAdmin, response } = await requireAdminSession();
  if (!isAdmin) return response!;

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('admin_settings')
    .select('id, approval_mode')
    .eq('id', 1)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: { message: 'Failed to fetch admin settings.', code: 'FETCH_ERROR' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
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
