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

        // Single atomic updateMany — O(1) DB operations regardless of count
        const result = await Listing.updateMany(
            {
                status: { $in: ['pending', 'approved'] },
                isDeleted: false,
                expiresAt: { $lt: new Date() },
            },
            { $set: { status: 'expired', isExpired: true } }
        );

        const count = result.modifiedCount;
        console.log(`Expired ${count} listings`);

        return NextResponse.json({ expired: count });
    } catch (error) {
        console.error('Cron Expire Listings Error:', error);
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}
