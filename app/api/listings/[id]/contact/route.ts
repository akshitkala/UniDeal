import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // a. Session check (401 if not logged in)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: "You must be signed in to contact sellers." } },
        { status: 401 }
      );
    }

    // Testing mock hook for email verification verification
    if (request.headers.get("x-mock-unconfirmed") === "true") {
      user.email_confirmed_at = undefined;
    }

    // b. is_banned check (403 if true)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_banned")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: { message: "Could not verify user profile status." } },
        { status: 403 }
      );
    }

    if (profile.is_banned) {
      return NextResponse.json(
        { error: { message: "Your account is banned." } },
        { status: 403 }
      );
    }

    // c. email_confirmed_at check (403, "Verify your email to contact sellers")
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: { message: "Verify your email to contact sellers." } },
        { status: 403 }
      );
    }

    // d. Rate limit check — count contact_reveals in the last rolling 24h, 429 if >= 50
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("contact_reveals")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gt("created_at", oneDayAgo);

    if (countError) {
      console.error("Error checking contact reveals count:", countError);
    }

    if (count !== null && count >= 50) {
      return NextResponse.json(
        { error: { message: "Daily limit reached. Try again tomorrow." } },
        { status: 429 }
      );
    }

    // e. Fetch seller's whatsapp_number (use admin client to bypass column level select restrictions)
    const adminSupabase = createSupabaseAdminClient();
    const { data: listing, error: listingError } = await adminSupabase
      .from("listings")
      .select("seller_id, title")
      .eq("id", id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: { message: "Listing not found." } },
        { status: 404 }
      );
    }

    const { data: seller, error: sellerError } = await adminSupabase
      .from("profiles")
      .select("whatsapp_number")
      .eq("id", listing.seller_id)
      .single();

    if (sellerError || !seller || !seller.whatsapp_number) {
      return NextResponse.json(
        { error: { message: "Seller contact not available." } },
        { status: 404 }
      );
    }

    // f. Insert into contact_reveals using authenticated client
    const { error: insertError } = await supabase
      .from("contact_reveals")
      .insert({
        user_id: user.id,
        listing_id: id,
      });

    if (insertError) {
      console.error("Failed to insert contact reveal record:", insertError);
      return NextResponse.json(
        { error: { message: "Could not record contact reveal." } },
        { status: 500 }
      );
    }

    // g. Build the wa.me link server-side
    const cleanNumber = seller.whatsapp_number.replace(/\D/g, "");
    const messageText = `Hi! I'm interested in your listing "${listing.title}" on UniDeal.`;
    const waLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`;

    // h. Return { data: { waLink } }
    return NextResponse.json({ data: { waLink } }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in contact reveal endpoint:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred. Please try again." } },
      { status: 500 }
    );
  }
}
