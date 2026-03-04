import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Report } from "@/models/Report";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import { requireAuth } from "@/middleware/auth";
import { TokenPayload } from "@/lib/auth/jwt";

export async function POST(request: Request) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;
        const userPayload = userOrResponse as TokenPayload;

        const body = await request.json();
        const { listingId, reason, description } = body;

        if (!listingId || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();

        // Find MongoDB ID for the user
        const user = await User.findOne({ uid: userPayload.uid });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const report = new Report({
            listing: listingId,
            reporter: user._id,
            reason,
            description,
        });

        await report.save();

        return NextResponse.json({ success: true, message: "Report submitted successfully" }, { status: 201 });
    } catch (error) {
        console.error("POST Report Error:", error);
        return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
    }
}
