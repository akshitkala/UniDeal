import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import '@/models/Listing';
import '@/models/User';
import { requireAuth } from "@/middleware/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;
        const userPayload = userOrResponse;

        await connectDB();
        const { slug } = await params;

        const listing = await Listing.findOne({ slug, isDeleted: false });
        if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

        const user = await User.findOne({ uid: userPayload.uid });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const isSaved = user.savedListings.includes(listing._id);

        if (isSaved) {
            // Unsave
            await Promise.all([
                User.updateOne({ _id: user._id }, { $pull: { savedListings: listing._id } }),
                Listing.updateOne({ _id: listing._id }, { $pull: { savedBy: user._id } })
            ]);
        } else {
            // Save
            await Promise.all([
                User.updateOne({ _id: user._id }, { $addToSet: { savedListings: listing._id } }),
                Listing.updateOne({ _id: listing._id }, { $addToSet: { savedBy: user._id } })
            ]);
        }

        return NextResponse.json({ saved: !isSaved });
    } catch (error) {
        console.error("Save Listing Error:", error);
        return NextResponse.json({ error: "Failed to update save status" }, { status: 500 });
    }
}
