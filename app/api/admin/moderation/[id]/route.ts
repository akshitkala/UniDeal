import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Report } from "@/models/Report";
import { requireAdmin } from "@/middleware/auth";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminOrResponse = await requireAdmin();
        if (adminOrResponse instanceof NextResponse) return adminOrResponse;

        const [paramsData, body] = await Promise.all([
            params,
            request.json()
        ]);
        const { id } = paramsData;
        const { status } = body;

        if (!["pending", "resolved", "dismissed"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await connectDB();
        const report = await Report.findByIdAndUpdate(id, { status }, { new: true });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("PATCH Report Error:", error);
        return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
    }
}
