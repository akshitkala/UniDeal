import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { requireAuth } from "@/middleware/auth";

export async function GET(req: Request) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;

        const user = userOrResponse;

        await connectDB();
        const listings = await Listing.find({
            sellerUid: user.uid,
            isDeleted: false
        }).sort({ createdAt: -1 }).populate("category", "name icon");

        return NextResponse.json({ listings });
    } catch (error) {
        console.error("GET User Listings Error:", error);
        return NextResponse.json({ error: "Failed to fetch your listings" }, { status: 500 });
    }
}
