import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { SystemConfig } from "@/models/SystemConfig";
import { User } from "@/models/User";
import { requireSuperadmin } from "@/middleware/auth";
import { AdminActivity } from "@/models/AdminActivity";

export async function PATCH(req: Request) {
    try {
        const payloadOrResponse = await requireSuperadmin();
        if (payloadOrResponse instanceof NextResponse) return payloadOrResponse;
        const payload = payloadOrResponse;

        await connectDB();
        const user = await User.findOne({ uid: payload.uid });
        if (!user) return NextResponse.json({ error: "Admin user not found" }, { status: 404 });

        const body = await req.json();
        const { approvalMode, maintenanceMode, allowNewListings } = body;

        const update: any = {};
        if (approvalMode !== undefined) update.approvalMode = approvalMode;
        if (maintenanceMode !== undefined) update.maintenanceMode = maintenanceMode;
        if (allowNewListings !== undefined) update.allowNewListings = allowNewListings;
        update.updatedBy = user._id;

        const config = await SystemConfig.findOneAndUpdate(
            { _id: "global" },
            { $set: update },
            { upsert: true, new: true }
        );

        // Audit Log
        if (maintenanceMode !== undefined) {
            await AdminActivity.create({
                admin: user._id,
                action: "MAINTENANCE_MODE_CHANGED",
                details: `Maintenance mode set to ${maintenanceMode}`,
                ip: req.headers.get("x-forwarded-for") || "unknown"
            });
        }
        if (approvalMode !== undefined) {
            await AdminActivity.create({
                admin: user._id,
                action: "APPROVAL_MODE_CHANGED",
                details: `Approval mode set to ${approvalMode}`,
                ip: req.headers.get("x-forwarded-for") || "unknown"
            });
        }

        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error("Superadmin Config Error:", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const userOrResponse = await requireSuperadmin();
        if (userOrResponse instanceof NextResponse) return userOrResponse;

        await connectDB();
        const config = await SystemConfig.findOne({ _id: "global" });
        return NextResponse.json({ config });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}
