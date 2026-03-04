import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { requireAuth } from "@/middleware/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis for rate limiting
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(3, "30 s"),
    })
    : null;

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;

        const user = userOrResponse;

        // Rate Limit Check
        if (ratelimit) {
            const { success } = await ratelimit.limit(`contact:${user.uid}`);
            if (!success) {
                return NextResponse.json({ error: "Too many requests. Please wait 30s." }, { status: 429 });
            }
        }

        await connectDB();
        const listing = await Listing.findOne({ slug }).select("+sellerPhone +sellerEmail");

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        // Security check: Don't show contact info if the listing is deleted or expired
        if (listing.isDeleted || listing.isExpired) {
            return NextResponse.json({ error: "Listing is no longer active" }, { status: 403 });
        }

        // Check if user is verified (optional but recommended)
        // if (!user.email_verified) { ... }

        return NextResponse.json({
            phone: listing.sellerPhone,
            email: listing.sellerEmail
        });
    } catch (error) {
        console.error("GET Contact Error:", error);
        return NextResponse.json({ error: "Failed to fetch contact details" }, { status: 500 });
    }
}
