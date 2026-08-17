import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const ALLOWED_REASONS = [
  "Fake listing",
  "Prohibited item",
  "Misleading price",
  "Spam",
  "Other"
];

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // 1. Session check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: "You must be signed in to report a listing." } },
        { status: 401 }
      );
    }

    // 2. Check if user profile is banned
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_banned")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: { message: "Could not verify user status." } },
        { status: 403 }
      );
    }

    if (profile.is_banned) {
      return NextResponse.json(
        { error: { message: "Your account is banned." } },
        { status: 403 }
      );
    }

    // 3. Check if user is email-verified
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: { message: "Verify your email to report listings." } },
        { status: 403 }
      );
    }

    // 4. Validate the report reason
    const body = await request.json();
    const { reason } = body;

    if (!reason || !ALLOWED_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: { message: `Invalid reason. Must be one of: ${ALLOWED_REASONS.join(", ")}` } },
        { status: 400 }
      );
    }

    // 5. Insert the report
    const { error: insertError } = await supabase
      .from("reports")
      .insert({
        listing_id: id,
        reporter_id: user.id,
        reason: reason,
      });

    if (insertError) {
      // Postgres unique constraint violation code is '23505'
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: { message: "You've already reported this listing." } },
          { status: 409 }
        );
      }

      console.error("Database error creating listing report:", insertError);
      return NextResponse.json(
        { error: { message: "Failed to submit report. Please try again." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in report listing endpoint:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
