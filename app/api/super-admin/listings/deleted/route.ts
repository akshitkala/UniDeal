import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireSuperadmin } from "@/middleware/auth";
import { Listing } from "@/models/Listing";
import "@/models/User";
import "@/models/Category";

export async function GET(req: NextRequest) {
    try {
        const authRes = await requireSuperadmin();
        if (authRes instanceof NextResponse) return authRes;

        await connectDB();
        const listings = await Listing.find({ isDeleted: true })
            .populate("seller", "displayName")
            .populate("category", "name")
            .sort({ deletedAt: -1 })
            .lean();

        return NextResponse.json({ listings: JSON.parse(JSON.stringify(listings)) });
    } catch (error: any) {
        console.error("GET Deleted Listings Error:", error);
        return NextResponse.json({ error: "Failed to fetch deleted listings" }, { status: 500 });
    }
}
