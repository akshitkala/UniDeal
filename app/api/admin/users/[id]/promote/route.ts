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
    const { errorResponse, supabase, user: currentUser } = await verifyAdminRequest();
    if (errorResponse) return errorResponse;

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({
        is_admin: true,
        promoted_by: currentUser.id,
        promoted_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, full_name, is_admin, is_banned, promoted_by, promoted_at")
      .single();

    if (error || !updatedProfile) {
      console.error("Error promoting user profile to admin:", error);
      return NextResponse.json(
        { error: { message: "Failed to promote user to admin." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedProfile }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in promote user POST:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
