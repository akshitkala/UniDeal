import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET() {
  try {
    const { errorResponse, supabase } = await verifyAdminRequest();
    if (errorResponse) return errorResponse;

    const { data: listings, error } = await supabase
      .from("listings")
      .select(`
        *,
        category:categories(name, slug),
        seller:public_profiles!listings_seller_id_fkey(id, full_name, branch, year)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending listings:", error);
      return NextResponse.json(
        { error: { message: "Failed to fetch pending listings." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: listings }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in pending listings GET:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
