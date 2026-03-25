import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { Category } from "@/models/Category";
import { User } from "@/models/User";
import { SystemConfig } from "@/models/SystemConfig";
import { ListingRepository } from '@/lib/db/repositories/listing.repository';
import { requireAuth, requireVerified } from "@/middleware/auth";
import { TokenPayload } from "@/lib/auth/jwt";
import { moderateListing } from "@/lib/ai/moderation";

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);

        const categorySlug = searchParams.get("category");
        const condition = searchParams.get("condition");
        const sort = searchParams.get("sort") || "newest";
        const search = searchParams.get("search");

        const query: any = { status: "approved", isExpired: false, isDeleted: false };

        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug }).select('_id').lean();
            if (category) query.category = category._id;
        }

        if (condition && condition !== "all") {
            query.condition = condition;
        }

        if (search) {
            query.$text = { $search: search };
            query.score = { $meta: 'textScore' };
        }

        const page = parseInt(searchParams.get("page") ?? "1");
        const limit = parseInt(searchParams.get("limit") ?? "12");

        const result = await ListingRepository.findPaginated(query, page, limit);

        return NextResponse.json(result, {
            headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' },
        });
    } catch (error) {
        console.error("GET Listings Error:", error);
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;
        const userPayload = userOrResponse as TokenPayload;

        const verifiedOrResponse = await requireVerified();
        if (verifiedOrResponse instanceof NextResponse) return verifiedOrResponse;
        const verifiedPayload = verifiedOrResponse;

        await connectDB();
        const [config, user] = await Promise.all([
            SystemConfig.findById("global").lean(),
            User.findOne({ uid: userPayload.uid }).select("+email").lean()
        ]);

        if (config && !config.allowNewListings) {
            return NextResponse.json({ error: "New listings are paused" }, { status: 503 });
        }

        const body = await request.json();
        const { title, description, price, negotiable, category, condition, images, location, whatsapp } = body;

        if (!whatsapp) {
            return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 });
        }

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const imageUrl = Array.isArray(images) ? images[0] : undefined;

        const listing = new Listing({
            title,
            description,
            price,
            negotiable,
            category,
            condition,
            images,
            location,
            seller: user._id,
            sellerWhatsapp: whatsapp,
            sellerEmail: user.email,
        });

        // AI Moderation — always run to catch image mismatches
        const mod = await moderateListing({ title, description, imageUrl });
        listing.aiFlagged = mod.flagged || Boolean(mod.mismatch);
        (listing as any).aiFlagReason = mod.mismatch
            ? `Image mismatch: ${mod.reason ?? 'Image does not match listing title'}`
            : mod.reason ?? null;

        if (config?.approvalMode === "ai-gated") {
            if (mod.flagged || mod.mismatch) {
                listing.status = "pending"; // hold for admin review
            } else {
                listing.status = mod.shouldAutoApprove ? "approved" : "pending";
            }
        } else {
            listing.status = config?.approvalMode === "automatic" ? "approved" : "pending";
        }

        await listing.save();

        return NextResponse.json({
            slug: listing.slug,
            status: listing.status,
            flagged: listing.status === "flagged",
            reason: listing.moderationReason
        }, { status: 201 });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error("POST Listing Error:", error);
        return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }
}
