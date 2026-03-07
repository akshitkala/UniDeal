import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAuth } from "@/middleware/auth";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import { TokenPayload } from "@/lib/auth/jwt";
import { logAction } from "@/lib/logAction";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const authRes = await requireAuth();
        if (authRes instanceof NextResponse) return authRes;
        const tokenUser = authRes as TokenPayload;

        const { slug } = await params;
        const listing = await Listing.findOne({ slug, isDeleted: false });
        if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const user = await User.findOne({ uid: tokenUser.uid });
        if (!user || listing.seller.toString() !== user._id.toString()) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (listing.status !== 'rejected') {
            return NextResponse.json({ error: 'Only rejected listings can be relisted' }, { status: 400 });
        }

        listing.status = 'pending';
        listing.rejectionReason = null;
        listing.aiFlagged = false;
        if (listing.aiVerification) {
            listing.aiVerification.flagged = false;
            listing.aiVerification.reason = null;
        }

        await listing.save();

        await logAction({
            actor: user._id,
            actorType: 'user',
            action: 'LISTING_RELISTED',
            metadata: { listingId: listing._id, title: listing.title },
            ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Relist Listing Error:", error);
        return NextResponse.json({ error: "Failed to relist" }, { status: 500 });
    }
}
