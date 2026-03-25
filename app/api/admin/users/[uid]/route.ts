import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireSuperadmin } from '@/middleware/auth';
import { User } from '@/models/User';
import { logAction } from '@/lib/logAction';
import { TokenPayload } from '@/lib/auth/jwt';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        const adminOrResponse = await requireSuperadmin();
        if (adminOrResponse instanceof NextResponse) return adminOrResponse;
        const actor = adminOrResponse as TokenPayload;

        await connectDB();
        const [paramsData, body] = await Promise.all([
            params,
            req.json()
        ]);
        const { uid } = paramsData;
        const { action, role } = body;

        const target = await User.findOne({ uid });
        if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const previousRole = target.role;

        if (action === 'ban') {
            target.isActive = false;
            target.bannedAt = new Date();
            target.bannedBy = actor.uid;
            await target.save();
            await logAction({
                actor: actor.uid,
                actorType: 'user',
                action: 'USER_BANNED',
                metadata: { targetUid: target.uid, targetName: target.displayName },
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
                metadata: { targetUid: target.uid, targetName: target.displayName },
                ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
            });
        } else if (action === 'role') {
            if (!role) return NextResponse.json({ error: 'Role is required' }, { status: 400 });
            target.role = role;
            await target.save();
            await logAction({
                actor: actor.uid,
                actorType: 'user',
                action: 'ROLE_CHANGED',
                metadata: {
                    targetUid: target.uid,
                    targetName: target.displayName,
                    oldRole: previousRole,
                    newRole: target.role,
                },
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
