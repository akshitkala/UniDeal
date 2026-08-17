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

    const { data: updatedListing, error } = await supabase
      .from("listings")
      .update({
        status: "approved",
        rejection_reason: null, // Clear any previous rejection reason
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !updatedListing) {
      console.error("Error approving listing:", error);
      return NextResponse.json(
        { error: { message: "Failed to approve listing." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedListing }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in approve listing PATCH:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
