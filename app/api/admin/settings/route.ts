import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET() {
  try {
    const { errorResponse, supabase } = await verifyAdminRequest();
    if (errorResponse) return errorResponse;

    const { data: settings, error } = await supabase
      .from("admin_settings")
      .select("approval_mode")
      .eq("id", 1)
      .single();

    if (error || !settings) {
      console.error("Error fetching admin settings:", error);
      return NextResponse.json(
        { error: { message: "Failed to fetch admin settings." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: settings }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in admin settings GET:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { errorResponse, supabase } = await verifyAdminRequest();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { approval_mode } = body;

    if (!approval_mode || !["auto", "manual"].includes(approval_mode)) {
      return NextResponse.json(
        { error: { message: "Invalid approval_mode. Must be 'auto' or 'manual'." } },
        { status: 400 }
      );
    }

    const { data: updatedSettings, error } = await supabase
      .from("admin_settings")
      .update({ approval_mode })
      .eq("id", 1)
      .select()
      .single();

    if (error || !updatedSettings) {
      console.error("Error updating admin settings:", error);
      return NextResponse.json(
        { error: { message: "Failed to update admin settings." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedSettings }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in admin settings PATCH:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
