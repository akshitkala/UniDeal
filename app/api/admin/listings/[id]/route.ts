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
        const { id } = await params;
        const { action, rejectionReason } = await req.json();

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
                metadata: { reason: rejectionReason },
                ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
            });

            // Send rejection email if Resend is configured
            if (process.env.RESEND_API_KEY) {
                const seller = await User.findById(listing.seller).select('+email displayName');
                if (seller?.email) {
                    const { resend } = await import('@/lib/resend');
                    resend.emails.send({
                        from: 'UniDeal <noreply@unideal.in>',
                        to: seller.email,
                        subject: 'Your listing was not approved',
                        text: `Hi ${seller.displayName},\n\nYour listing "${listing.title}" was not approved.\n\nReason: ${listing.rejectionReason}\n\nYou can edit and resubmit your listing.\n\nTeam UniDeal`,
                    }).catch(console.error);
                }
            }
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH Admin Listing Error:', error);
        return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }
}
