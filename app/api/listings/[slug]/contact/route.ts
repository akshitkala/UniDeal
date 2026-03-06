import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import '@/models/Listing';
import '@/models/User';
import { requireAuth, requireVerified } from "@/middleware/auth";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, "86400 s"), // 20 per 24 hours
    })
    : null;

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;

        const verifiedOrResponse = await requireVerified();
        if (verifiedOrResponse instanceof NextResponse) return verifiedOrResponse;

        const user = userOrResponse;

        if (ratelimit) {
            const { success } = await ratelimit.limit(`contact:${user.uid}`);
            if (!success) {
                return NextResponse.json({ error: "Daily limit reached (20). Please try again tomorrow." }, { status: 429 });
            }
        }

        await connectDB();
        const listing = await Listing.findOne({ slug, isDeleted: false, isExpired: false });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found or inactive" }, { status: 404 });
        }

        const seller = await User.findById(listing.seller).select("+phone +whatsappNumber");
        if (!seller) {
            return NextResponse.json({ error: "Seller no longer active" }, { status: 404 });
        }

        const rawPhone = seller.whatsappNumber || seller.phone;
        if (!rawPhone) {
            return NextResponse.json({ error: "no_number" }, { status: 400 });
        }

        const digits = rawPhone.replace(/\D/g, "");
        const msg = encodeURIComponent(`Hi! I saw your ${listing.title} on UniDeal for ₹${listing.price.toLocaleString("en-IN")}. Is it still available?`);
        const waLink = `https://wa.me/91${digits}?text=${msg}`;

        return NextResponse.json({ waLink });
    } catch (error) {
        console.error("POST Contact Error:", error);
        return NextResponse.json({ error: "Failed to generate contact link" }, { status: 500 });
    }
}
