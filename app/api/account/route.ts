import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * DELETE /api/account — self-service account deletion (new feature; not previously
 * scoped in PRD/TRD, noted in progress.md per rules.md §10).
 *
 * Session check → service-role `auth.admin.deleteUser` (service-role only, rules.md §3).
 * The profile row and everything hanging off it (listings, reports, contact_reveals,
 * WhatsApp number) are removed by the schema's existing `on delete cascade` chain
 * (auth.users → profiles → listings) — application code deletes no rows manually.
 * Fail closed (rules.md §7.4): any Auth API failure → error response, account intact.
 */

/**
 * Best-effort Cloudinary cleanup of the user's listing images (TRD §6.5, rules.md §7.4
 * fail-open): fire-and-forget, never blocks or fails the deletion, failures logged
 * server-side only. Requires the optional CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 * env vars (signed destroy call); without them it logs and skips.
 */
async function cleanupListingImages(urls: string[]) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (urls.length === 0) return;
  if (!cloudName || !apiKey || !apiSecret) {
    console.log(`Cloudinary cleanup skipped for ${urls.length} image(s): CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET not configured.`);
    return;
  }

  for (const url of urls) {
    try {
      // secure_url shape: https://res.cloudinary.com/<cloud>/image/upload/v123/unideal/listings/<id>.<ext>
      const path = url.split('/image/upload/')[1];
      const publicId = path?.replace(/^v\d+\//, '').replace(/\.[a-z0-9]+$/i, '');
      if (!publicId) continue;

      const timestamp = Math.floor(Date.now() / 1000);
      const signature = createHash('sha1')
        .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
        .digest('hex');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId, timestamp, api_key: apiKey, signature }),
      });
      if (!res.ok) console.error(`Cloudinary cleanup failed for ${publicId}: HTTP ${res.status}`);
    } catch (err) {
      console.error(`Cloudinary cleanup failed for ${url}`, err);
    }
  }
}

/**
 * DELETE /api/account — deletes the signed-in user's own account (acts on auth.uid()).
 */
export async function DELETE() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: 'You must be signed in to delete your account.', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const adminClient = createAdminClient();

    // Collect the user's listing images first — the FK cascade removes the rows below.
    const { data: listings } = await adminClient
      .from('listings')
      .select('images')
      .eq('seller_id', user.id);
    const imageUrls = (listings ?? []).flatMap((l) => l.images ?? []);

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      // e.g. an admin whose promoted_by / resolved_by references block the cascade —
      // fail closed, account is left intact.
      console.error('Account deletion failed', deleteError);
      return NextResponse.json(
        {
          error: {
            message: "Couldn't delete your account. Please try again or contact support if the problem continues.",
            code: 'DELETE_ERROR',
          },
        },
        { status: 500 }
      );
    }

    // Fire-and-forget, fail-open (rules.md §7.4) — must not delay or fail the response.
    void cleanupListingImages(imageUrls);

    return NextResponse.json({ data: { deleted: true } });
  } catch {
    return NextResponse.json(
      { error: { message: "Couldn't delete your account. Please try again.", code: 'SERVER_ERROR' } },
      { status: 500 }
    );
  }
}
