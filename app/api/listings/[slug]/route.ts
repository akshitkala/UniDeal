import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import '@/models/Listing';
import '@/models/Category';
import '@/models/User';
import { requireAuth, requireOwnership } from "@/middleware/auth";
import { TokenPayload } from "@/lib/auth/jwt";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectDB();
        const { slug } = await params;

        // Increment views and fetch
        const listing = await Listing.findOneAndUpdate(
            { slug, isDeleted: false },
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate("category", "name icon slug")
            .populate("seller", "displayName uid emailVerified");

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        return NextResponse.json({ listing });
    } catch (error) {
        console.error("GET Listing Detail Error:", error);
        return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;
        const userPayload = userOrResponse as TokenPayload;

        await connectDB();
        const { slug } = await params;
        const listing = await Listing.findOne({ slug, isDeleted: false });

        if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

        const ownedOrResponse = await requireOwnership(listing.seller.toString());
        // Note: requireOwnership in middleware/auth.ts takes resourceUserId as string.
        // However, my previous implementation of requireOwnership takes resourceUserId.
        // Let's verify and adjust if needed.
        if (ownedOrResponse instanceof NextResponse) return ownedOrResponse;

        const body = await request.json();
        const allowedFields = ["title", "description", "price", "negotiable", "condition", "images", "location", "status"];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                (listing as any)[field] = body[field];
            }
        });

        await listing.save();
        return NextResponse.json({ success: true, listing });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error("PATCH Listing Error:", error);
        return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;

        await connectDB();
        const { slug } = await params;
        const listing = await Listing.findOne({ slug, isDeleted: false });

        if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

        const ownedOrResponse = await requireOwnership(listing.seller.toString());
        if (ownedOrResponse instanceof NextResponse) return ownedOrResponse;

        listing.isDeleted = true;
        await listing.save();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error("DELETE Listing Error:", error);
        return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
    }
}
