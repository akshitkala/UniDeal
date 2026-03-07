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
        const superOrResponse = await requireSuperadmin();
        if (superOrResponse instanceof NextResponse) return superOrResponse;
        const actor = superOrResponse as TokenPayload;

        await connectDB();
        const { uid } = await params;
        const { role, action } = await req.json();

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
            return NextResponse.json({ success: true });
        }

        if (action === 'unban') {
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
            return NextResponse.json({ success: true });
        }

        if (role) {
            if (!['user', 'admin', 'superadmin'].includes(role)) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
            }
            const previousRole = target.role;
            target.role = role;
            await target.save();

            await logAction({
                actor: actor.uid,
                actorType: 'user',
                action: 'ROLE_CHANGED',
                target: target._id.toString(),
                targetModel: 'User',
                metadata: { previousRole, newRole: role },
                ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH Super-admin User Error:', error);
        return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }
}
