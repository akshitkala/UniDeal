import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireSuperadmin } from '@/middleware/auth';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const adminOrResponse = await requireSuperadmin();
        if (adminOrResponse instanceof NextResponse) return adminOrResponse;

        await connectDB();
        const users = await User.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json({ users: JSON.parse(JSON.stringify(users)) });
    } catch (error) {
        console.error('GET Admin Users Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
