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
    const { action } = body;

    if (!action || !["remove", "dismiss"].includes(action)) {
      return NextResponse.json(
        { error: { message: "Invalid action. Must be 'remove' or 'dismiss'." } },
        { status: 400 }
      );
    }

    // Fetch the report to get listing_id
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("listing_id")
      .eq("id", id)
      .single();

    if (fetchError || !report) {
      return NextResponse.json(
        { error: { message: "Report not found." } },
        { status: 404 }
      );
    }

    if (action === "remove") {
      // 1. Set listing status to 'rejected' and add reason
      const { error: updateListingErr } = await supabase
        .from("listings")
        .update({
          status: "rejected",
          rejection_reason: "Removed by Admin due to community reports.",
        })
        .eq("id", report.listing_id);

      if (updateListingErr) {
        console.error("Error rejecting listing from report:", updateListingErr);
        return NextResponse.json(
          { error: { message: "Failed to remove listing." } },
          { status: 500 }
        );
      }

      // 2. Resolve the report as resolved_removed
      const { data: resolvedReport, error: updateReportErr } = await supabase
        .from("reports")
        .update({
          status: "resolved_removed",
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateReportErr || !resolvedReport) {
        console.error("Error resolving report:", updateReportErr);
        return NextResponse.json(
          { error: { message: "Failed to resolve report." } },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: resolvedReport }, { status: 200 });
    } else {
      // action === "dismiss"
      // Resolve the report as resolved_dismissed
      const { data: resolvedReport, error: updateReportErr } = await supabase
        .from("reports")
        .update({
          status: "resolved_dismissed",
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateReportErr || !resolvedReport) {
        console.error("Error resolving report:", updateReportErr);
        return NextResponse.json(
          { error: { message: "Failed to resolve report." } },
          { status: 500 }
        );
      }

      return NextResponse.json({ data: resolvedReport }, { status: 200 });
    }
  } catch (error) {
    console.error("Unexpected error in resolve report PATCH:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
