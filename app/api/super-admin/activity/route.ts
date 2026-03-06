import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireSuperadmin } from '@/middleware/auth';
import { AdminActivity } from '@/models/AdminActivity';

export async function GET(req: NextRequest) {
    try {
        const superOrResponse = await requireSuperadmin();
        if (superOrResponse instanceof NextResponse) return superOrResponse;

        await connectDB();

        const page    = Number(req.nextUrl.searchParams.get('page') ?? 1);
        const showIps = req.nextUrl.searchParams.get('showIps') === 'true';
        const limit   = 20;

        const activities = await AdminActivity.find()
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const total = await AdminActivity.countDocuments();

        const result = activities.map((a: any) => ({
            ...a,
            ipAddress: showIps ? a.ipAddress : (a.ipAddress?.replace(/\.\d+$/, '.x') ?? null),
        }));

        return NextResponse.json({ activities: result, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('GET Super-admin Activity Error:', error);
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }
}
