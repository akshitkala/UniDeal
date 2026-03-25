import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireSuperadmin } from "@/middleware/auth";
import { Listing } from "@/models/Listing";
import { logAction } from "@/lib/logAction";
import { TokenPayload } from "@/lib/auth/jwt";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const [authRes, paramsData] = await Promise.all([
            requireSuperadmin(),
            params
        ]);
        if (authRes instanceof NextResponse) return authRes;
        const user = authRes as TokenPayload;

        const { id } = paramsData;
        const listing = await Listing.findById(id);

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        listing.isDeleted = false;
        listing.deletedAt = null;
        await listing.save();

        await logAction({
            actor: user.uid,
            actorType: 'user',
            action: 'LISTING_RESTORED',
            metadata: { listingId: listing._id, title: listing.title },
            ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
        });

        return NextResponse.json({ success: true, listing });
    } catch (error: any) {
        console.error("Restore Listing Error:", error);
        return NextResponse.json({ error: "Failed to restore listing" }, { status: 500 });
    }
}
