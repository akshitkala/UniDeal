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
        const listing = await Listing.findOne({ slug, isDeleted: false, isExpired: false }).select('+sellerWhatsapp +sellerPhone');

        if (!listing) {
            return NextResponse.json({ error: "Listing not found or inactive" }, { status: 404 });
        }

        const seller = await User.findById(listing.seller).select("+phone +whatsappNumber");
        if (!seller) {
            return NextResponse.json({ error: "Seller no longer active" }, { status: 404 });
        }

        const contactNumber = listing.sellerWhatsapp ?? seller.whatsappNumber;

        if (!contactNumber) {
            return NextResponse.json({ error: 'Seller has not added a WhatsApp number yet' }, { status: 400 });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unideal.vercel.app';
        const message = `Hi! I found your listing on UniDeal 👋\n\n*${listing.title}*\n💰 ₹${listing.price.toLocaleString('en-IN')}\n📦 Condition: ${listing.condition}\n\n🔗 ${siteUrl}/listings/${listing.slug}\n\nIs this still available?`;

        const waLink = `https://wa.me/${contactNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;

        return NextResponse.json({ waLink });
    } catch (error) {
        console.error("POST Contact Error:", error);
        return NextResponse.json({ error: "Failed to generate contact link" }, { status: 500 });
    }
}
