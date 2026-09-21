import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback
 * Handles the OAuth redirect from Supabase (Google sign-in).
 * Exchanges the code for a session, then redirects to `next` param or home.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redirect to intended destination after successful OAuth
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send back to home with an error indicator
  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
