import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Report } from "@/models/Report";
import { User } from "@/models/User";
import { requireAuth, requireVerified } from "@/middleware/auth";
import { TokenPayload } from "@/lib/auth/jwt";

export async function POST(request: Request) {
    try {
        const [auth, verified] = await Promise.all([
            requireAuth(),
            requireVerified()
        ]);
        if (auth instanceof NextResponse) return auth;
        if (verified instanceof NextResponse) return verified;

        const userPayload = auth as TokenPayload;

        // Rate limit: 10 reports per 24 hours per user (only if Upstash is configured)
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            const { rateLimit } = await import('@/lib/rateLimit');
            
            const { allowed } = await rateLimit(`report:${userPayload.uid}`, 10, 86400);
            if (!allowed) {
                return NextResponse.json(
                    { error: "Too many reports. Try again tomorrow." },
                    { status: 429 }
                );
            }
        }

        const [body, _] = await Promise.all([
            request.json(),
            connectDB()
        ]);
        const { listingId, reason, description } = body;

        if (!listingId || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

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
