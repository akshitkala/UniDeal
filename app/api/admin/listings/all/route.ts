import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireAdmin } from '@/middleware/auth';
import { Listing } from '@/models/Listing';
import '@/models/User';
import '@/models/Category';

export async function GET(req: NextRequest) {
    try {
        const adminOrResponse = await requireAdmin();
        if (adminOrResponse instanceof NextResponse) return adminOrResponse;

        await connectDB();
        const listings = await Listing.find({ isDeleted: false })
            .populate('seller', 'displayName')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ listings: JSON.parse(JSON.stringify(listings)) });
    } catch (error) {
        console.error('GET All Listings Error:', error);
        return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }
}
