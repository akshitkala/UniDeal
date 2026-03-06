import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { Listing } from '@/models/Listing';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const secret = req.headers.get('x-cron-secret');
        if (secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const expired = await Listing.find({
            expiresAt: { $lt: new Date() },
            isExpired: false,
            isDeleted: false,
        });

        let count = 0;
        for (const listing of expired) {
            listing.isExpired = true;
            await listing.save();
            count++;

            // Send expiry email if Resend is configured
            if (process.env.RESEND_API_KEY) {
                const { resend } = await import('@/lib/resend');
                const seller = await User.findById(listing.seller).select('+email displayName');
                if (seller?.email) {
                    resend.emails.send({
                        from: 'UniDeal <noreply@unideal.in>',
                        to: seller.email,
                        subject: 'Your UniDeal listing has expired',
                        text: `Hi ${seller.displayName},\n\nYour listing "${listing.title}" has expired after 60 days.\n\nRe-list it to keep selling.\n\nTeam UniDeal`,
                    }).catch(console.error);
                }
            }
        }

        return NextResponse.json({ expired: count });
    } catch (error) {
        console.error('Cron Expire Listings Error:', error);
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}
