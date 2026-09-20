import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildWhatsAppLink } from '@/lib/whatsapp';

interface RouteContext {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteContext) {
  const { id: listingId } = params;
  try {
    const supabase = await createServerClient();
    const adminClient = createAdminClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: { message: 'You must be signed in to contact sellers.', code: 'UNAUTHORIZED' } }, { status: 401 });
    }
    const { data: profile } = await adminClient.from('profiles').select('is_banned').eq('id', user.id).single();
    if (profile?.is_banned) {
      return NextResponse.json({ error: { message: 'Your account has been restricted. Contact support for help.', code: 'FORBIDDEN' } }, { status: 403 });
    }
    if (!user.email_confirmed_at) {
      return NextResponse.json({ error: { message: 'Verify your email to contact sellers.', code: 'UNVERIFIED' } }, { status: 403 });
    }
    const { count: revealCount, error: countError } = await supabase.from('contact_reveals').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    if (countError) { console.error('[contact] rate-limit count error:', countError.message); }
    else if ((revealCount ?? 0) >= 50) {
      return NextResponse.json({ error: { message: 'Daily limit reached. Try again tomorrow.', code: 'RATE_LIMITED' } }, { status: 429 });
    }
    const { data: listingData } = await adminClient.from('listings').select('title, seller_id, profiles!inner(whatsapp_number)').eq('id', listingId).single();
    if (!listingData) {
      return NextResponse.json({ error: { message: 'Listing not found.', code: 'NOT_FOUND' } }, { status: 404 });
    }
    const whatsappNumber = listingData.profiles?.whatsapp_number ?? null;
    if (!whatsappNumber) {
      return NextResponse.json({ error: { message: 'Seller contact not available.', code: 'NO_CONTACT' } }, { status: 404 });
    }
    const { error: revealError } = await supabase.from('contact_reveals').insert({ user_id: user.id, listing_id: listingId });
    if (revealError) {
      console.error('[contact] reveal insert error:', revealError);
      return NextResponse.json({ error: { message: 'Could not process your request. Please try again.', code: 'REVEAL_ERROR' } }, { status: 500 });
    }
    const waLink = buildWhatsAppLink(whatsappNumber, listingData.title);
    return NextResponse.json({ data: { waLink } });
  } catch (err) {
    console.error('[contact] unexpected error:', err);
    return NextResponse.json({ error: { message: 'Could not process your request. Please try again.', code: 'SERVER_ERROR' } }, { status: 500 });
  }
}
