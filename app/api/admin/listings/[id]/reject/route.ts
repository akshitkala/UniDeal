import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const { errorResponse, supabase } = await verifyAdminRequest();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: { message: "Rejection reason is required." } },
        { status: 400 }
      );
    }

    const { data: updatedListing, error } = await supabase
      .from("listings")
      .update({
        status: "rejected",
        rejection_reason: reason.trim(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !updatedListing) {
      console.error("Error rejecting listing:", error);
      return NextResponse.json(
        { error: { message: "Failed to reject listing." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedListing }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in reject listing PATCH:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
