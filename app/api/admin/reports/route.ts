import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireAdmin } from '@/middleware/auth';
import { Report } from '@/models/Report';
import '@/models/User';
import '@/models/Listing';

export async function GET(req: NextRequest) {
    try {
        const adminOrResponse = await requireAdmin();
        if (adminOrResponse instanceof NextResponse) return adminOrResponse;

        await connectDB();
        const reports = await Report.find({ status: 'pending' })
            .populate('listing', 'title slug images')
            .populate('reporter', 'displayName')
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ reports: JSON.parse(JSON.stringify(reports)) });
    } catch (error) {
        console.error('GET Admin Reports Error:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}
