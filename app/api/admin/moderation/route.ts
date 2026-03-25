import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Report } from "@/models/Report";
import { requireAdmin } from "@/middleware/auth";

export async function GET() {
    try {
        const adminOrResponse = await requireAdmin();
        if (adminOrResponse instanceof NextResponse) return adminOrResponse;

        await connectDB();

        const reports = await Report.find({ status: "pending" })
            .select('reason description status createdAt listing reporter')
            .sort({ createdAt: -1 })
            .populate({
                path: "listing",
                select: 'title slug images status',
                populate: { path: "category", select: "name icon slug" }
            })
            .populate("reporter", "name email")
            .lean();

        return NextResponse.json({ reports });
    } catch (error) {
        console.error("GET Moderation Reports Error:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
