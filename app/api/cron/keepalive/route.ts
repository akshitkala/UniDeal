import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/cron/keepalive — Daily ping to prevent Supabase free-tier 7-day inactivity pause.
 * Protected by CRON_SECRET header (TRD §5.11).
 * vercel.json schedules this at 03:00 UTC daily.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    await supabase.from('categories').select('id').limit(1);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/cron/keepalive] ping failed:', err);
    // ponytail: fail open per rules.md §7.4 — log it, don't surface to caller
    return NextResponse.json({ ok: false });
  }
}
