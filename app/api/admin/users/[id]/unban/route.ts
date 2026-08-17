import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const { errorResponse, supabase } = await verifyAdminRequest();
    if (errorResponse) return errorResponse;

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        is_banned: false,
      })
      .eq("id", id)
      .select("id, full_name, is_admin, is_banned")
      .single();

    if (error || !updatedProfile) {
      console.error("Error unbanning user profile:", error);
      return NextResponse.json(
        { error: { message: "Failed to unban user." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedProfile }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in unban user POST:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
