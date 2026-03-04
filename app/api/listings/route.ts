import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { Category } from "@/models/Category";
import { User } from "@/models/User";
import { SystemConfig } from "@/models/SystemConfig";
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
            const category = await Category.findOne({ slug: categorySlug });
            if (category) query.category = category._id;
        }

        if (condition && condition !== "all") {
            query.condition = condition;
        }

        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        const sortMap: any = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            most_viewed: { views: -1 },
        };

        const listings = await Listing.find(query)
            .sort(sortMap[sort] || sortMap.newest)
            .limit(50)
            .populate("category", "name icon slug")
            .populate("seller", "displayName uid emailVerified");

        return NextResponse.json({ listings });
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
        const config = await SystemConfig.findById("global");
        if (config && !config.allowNewListings) {
            return NextResponse.json({ error: "New listings are paused" }, { status: 503 });
        }

        const body = await request.json();
        const { title, description, price, negotiable, category, condition, images, location } = body;

        const user = await User.findOne({ uid: userPayload.uid }).select("+email");
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
            sellerEmail: user.email,
        });

        // AI Moderation if enabled or mode is ai-gated
        if (config?.approvalMode === "ai-gated") {
            const mod = await moderateListing(title, description);
            if (mod.flagged) {
                listing.status = "flagged";
                listing.moderationReason = mod.reason;
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
