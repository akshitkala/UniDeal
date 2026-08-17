import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET() {
  try {
    const { errorResponse, supabase } = await verifyAdminRequest();
    if (errorResponse) return errorResponse;

    const { data: reports, error } = await supabase
      .from("reports")
      .select(`
        *,
        listing:listings(id, title, slug),
        reporter:public_profiles!reports_reporter_id_fkey(id, full_name, branch, year)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      return NextResponse.json(
        { error: { message: "Failed to fetch reports." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: reports }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in admin reports GET:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
