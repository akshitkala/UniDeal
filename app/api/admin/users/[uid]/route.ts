import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireAdmin } from '@/middleware/auth';
import { User } from '@/models/User';
import { logAction } from '@/lib/logAction';
import { TokenPayload } from '@/lib/auth/jwt';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const adminOrResponse = await requireAdmin();
        if (adminOrResponse instanceof NextResponse) return adminOrResponse;
        const actor = adminOrResponse as TokenPayload;

        await connectDB();
        const { uid } = await params;
        const { action } = await req.json();

        const target = await User.findOne({ uid });
        if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (action === 'ban') {
            target.isActive = false;
            target.bannedAt = new Date();
            target.bannedBy = actor.uid;
            await target.save();
            await logAction({
                actor: actor.uid,
                actorType: 'user',
                action: 'USER_BANNED',
                target: target._id.toString(),
                targetModel: 'User',
                ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
            });
        } else if (action === 'unban') {
            target.isActive = true;
            target.bannedAt = null;
            target.bannedBy = null;
            await target.save();
            await logAction({
                actor: actor.uid,
                actorType: 'user',
                action: 'USER_UNBANNED',
                target: target._id.toString(),
                targetModel: 'User',
                ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
            });
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH Admin User Error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
