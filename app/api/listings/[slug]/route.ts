import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireAuth } from "@/middleware/auth";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import { moderateListing } from "@/lib/ai/moderation";
import { TokenPayload } from "@/lib/auth/jwt";
import { logAction } from "@/lib/logAction";


export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const { slug } = await params;

        const listing = await Listing.findOne({ slug, isDeleted: false })
            .select('-__v')
            .populate('seller', 'displayName email whatsapp phone isVerified registrationNumber photoUrl firebaseUid')
            .populate('category', 'name slug icon')
            .lean();

        return NextResponse.json(
            { listing },
            {
                headers: {
                    'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
                },
            }
        );
    } catch (error: any) {
        console.error("GET Listing Detail Error:", error);
        return NextResponse.json({ error: "Failed to fetch listing details" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const authRes = await requireAuth();
        if (authRes instanceof NextResponse) return authRes;
        const tokenUser = authRes as TokenPayload;

        const [paramsData, user] = await Promise.all([
            params,
            User.findOne({ uid: tokenUser.uid }).lean()
        ]);
        const { slug } = paramsData;

        const listing = await Listing.findOne({ slug, isDeleted: false });
        if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const isOwner = listing.seller.toString() === user?._id.toString();

        if (!isOwner) {
            return NextResponse.json({ error: 'Only the listing owner can edit this listing' }, { status: 403 });
        }

        const body = await req.json();
        const allowed = ['title', 'description', 'price', 'condition', 'category', 'images', 'sellerWhatsapp'];

        allowed.forEach(key => {
            if (body[key] !== undefined) {
                (listing as any)[key] = body[key];
            }
        });

        // Specific status update if present (e.g. mark as sold)
        if (body.status === 'sold') {
            listing.status = 'sold';
        }

        // Only reset to pending and re-run moderation on content edit
        if (body.status !== 'sold') {
            listing.status = 'pending';
            listing.rejectionReason = null;
            listing.aiFlagged = false;

            try {
                const imageUrl = listing.images?.[0] ?? undefined;
                const mod = await moderateListing({ title: listing.title, description: listing.description, imageUrl });
                listing.aiFlagged = mod.flagged || Boolean(mod.mismatch);
                (listing as any).aiFlagReason = mod.mismatch
                    ? `Image mismatch: ${mod.reason ?? 'Image does not match listing title'}`
                    : mod.reason ?? null;
                listing.aiVerification = {
                    ...listing.aiVerification,
                    reason: mod.reason ?? null,
                    flagged: mod.flagged,
                    checked: true,
                    checkedAt: new Date()
                };
            } catch (err) {
                console.error("AI Moderation failed on edit:", err);
            }
        }

        await listing.save();
        return NextResponse.json({ listing });
    } catch (error: any) {
        console.error("PATCH Listing Error:", error);
        return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await connectDB();
        const authRes = await requireAuth();
        if (authRes instanceof NextResponse) return authRes;
        const tokenUser = authRes as TokenPayload;

        const [paramsData, user] = await Promise.all([
            params,
            User.findOne({ uid: tokenUser.uid }).lean()
        ]);
        const { slug } = paramsData;

        const listing = await Listing.findOne({ slug, isDeleted: false });
        if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const isAdmin = ['admin', 'superadmin'].includes(user?.role || '');
        const isOwner = listing.seller.toString() === user?._id.toString();

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Soft delete
        listing.isDeleted = true;
        listing.deletedAt = new Date();
        await listing.save();

        await logAction({
            actor: user._id,
            actorType: 'user',
            action: 'LISTING_DELETED',
            metadata: {
                listingId: listing._id,
                title: listing.title,
                deletedBy: user.role,
            },
            ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE Listing Error:", error);
        return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
    }
}
