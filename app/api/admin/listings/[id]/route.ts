import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireAdmin } from '@/middleware/auth';
import { Listing } from '@/models/Listing';
import { User } from '@/models/User';
import { logAction } from '@/lib/logAction';
import { TokenPayload } from '@/lib/auth/jwt';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const adminOrResponse = await requireAdmin();
        if (adminOrResponse instanceof NextResponse) return adminOrResponse;
        const admin = adminOrResponse as TokenPayload;

        await connectDB();
        const [paramsData, body] = await Promise.all([
            params,
            req.json()
        ]);
        const { id } = paramsData;
        const { action, rejectionReason } = body;

        const listing = await Listing.findById(id);
        if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (action === 'approve') {
            listing.status = 'approved';
            await listing.save();
            await logAction({
                actor: admin.uid,
                actorType: 'user',
                action: 'LISTING_APPROVED',
                target: listing._id.toString(),
                targetModel: 'Listing',
                metadata: {
                    listingId: listing._id,
                    title: listing.title,
                },
                ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
            });
        } else if (action === 'reject') {
            listing.status = 'rejected';
            listing.rejectionReason = rejectionReason ?? 'No reason provided';
            await listing.save();
            await logAction({
                actor: admin.uid,
                actorType: 'user',
                action: 'LISTING_REJECTED',
                target: listing._id.toString(),
                targetModel: 'Listing',
                metadata: {
                    listingId: listing._id,
                    title: listing.title,
                    ...(rejectionReason && { reason: rejectionReason }),
                },
                ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
            });

            // Send styled rejection email
            import('@/lib/emails/rejection').then(async ({ sendRejectionEmail }) => {
                const seller = await User.findById(listing.seller).select('+email displayName');
                if (seller?.email) {
                    sendRejectionEmail({
                        to: seller.email,
                        sellerName: seller.displayName ?? 'Seller',
                        listingTitle: listing.title,
                        listingPrice: listing.price,
                        listingCondition: listing.condition,
                        rejectionReason: listing.rejectionReason ?? 'Does not meet community guidelines',
                        listingSlug: listing.slug,
                    }).catch(() => { });
                }
            }).catch(() => { });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH Admin Listing Error:', error);
        return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }
}
