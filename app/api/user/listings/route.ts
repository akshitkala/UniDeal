import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import '@/models/Category';
import { requireAuth } from "@/middleware/auth";
import { TokenPayload } from "@/lib/auth/jwt";

export async function GET() {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;
        const tokenPayload = userOrResponse as TokenPayload;

        await connectDB();

        const user = await User.findOne({ uid: tokenPayload.uid }).select('_id').lean();
        if (!user) return NextResponse.json({ listings: [] });

        const listings = await Listing.find({ seller: user._id, isDeleted: false })
            .select('title price images condition slug category status createdAt')
            .populate('category', 'name icon slug')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ listings });
    } catch (error) {
        console.error("GET User Listings Error:", error);
        return NextResponse.json({ error: "Failed to fetch your listings" }, { status: 500 });
    }
}

