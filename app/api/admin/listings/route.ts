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

        const listings = await Listing.find({ status: 'pending', isDeleted: false })
            .select('title price images condition slug category createdAt seller status')
            .populate('seller', 'name email registrationNumber')
            .populate('category', 'name slug')
            .sort({ aiFlagged: -1, createdAt: 1 })
            .lean();

        return NextResponse.json({ listings });
    } catch (error) {
        console.error('GET Admin Listings Error:', error);
        return NextResponse.json({ error: 'Failed to fetch pending listings' }, { status: 500 });
    }
}
