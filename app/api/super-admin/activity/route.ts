import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireSuperadmin } from '@/middleware/auth';
import { AdminActivity } from '@/models/AdminActivity';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const superOrResponse = await requireSuperadmin();
        if (superOrResponse instanceof NextResponse) return superOrResponse;

        await connectDB();

        const page    = Number(req.nextUrl.searchParams.get('page') ?? 1);
        const showIps = req.nextUrl.searchParams.get('showIps') === 'true';
        const limit   = 20;

        const [activities, total] = await Promise.all([
            AdminActivity.find()
                .select('action actor target metadata timestamp')
                .populate('actor', 'name email')
                .sort({ timestamp: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            AdminActivity.countDocuments(),
        ]);

        const result = (activities as any[]).map((a) => ({
            ...a,
            // Resolve actor to a readable name
            actorName: a.actor?.name ?? a.actor?.email ?? 'System',
            // Mask IP unless caller requested full IPs
            ipAddress: showIps
                ? a.ipAddress
                : (a.ipAddress ?? null),
        }));

        return NextResponse.json({
            activities: result,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('GET Super-admin Activity Error:', error);
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }
}
