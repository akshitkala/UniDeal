import { NextResponse } from "next/server";
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

    // 1. Session check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: "You must be signed in to mark a listing as sold." } },
        { status: 401 }
      );
    }

    // 2. Fetch the listing to verify existence and ownership
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("seller_id, status")
      .eq("id", id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: { message: "Listing not found." } },
        { status: 404 }
      );
    }

    // 3. Ownership check
    if (listing.seller_id !== user.id) {
      return NextResponse.json(
        { error: { message: "You are not authorized to edit this listing." } },
        { status: 403 }
      );
    }

    // 4. Update the status to 'sold'
    const { data: updatedListing, error: updateError } = await supabase
      .from("listings")
      .update({
        status: "sold",
        sold_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedListing) {
      console.error("Error marking listing as sold:", updateError);
      return NextResponse.json(
        { error: { message: "Failed to mark listing as sold. Please try again." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedListing }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in mark as sold endpoint:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
