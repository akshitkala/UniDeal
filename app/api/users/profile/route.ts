import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { requireAuth } from '@/middleware/auth';
import { User } from '@/models/User';
import { TokenPayload } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;
        const tokenUser = userOrResponse as TokenPayload;

        await connectDB();
        const user = await User.findOne({ uid: tokenUser.uid });
        if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({
            displayName:    user.displayName,
            bio:            user.bio,
            location:       user.location,
            phone:          user.phone,
            whatsappNumber: user.whatsappNumber,
            photoURL:       user.photoURL,
        });
    } catch (error) {
        console.error('GET Profile Error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;
        const tokenUser = userOrResponse as TokenPayload;

        await connectDB();
        const { displayName, bio, location, phone, whatsappNumber } = await req.json();

        const user = await User.findOne({ uid: tokenUser.uid });
        if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (displayName !== undefined)    user.displayName    = displayName;
        if (bio !== undefined)            user.bio            = bio;
        if (location !== undefined)       user.location       = location;
        if (phone !== undefined)          user.phone          = phone;
        if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;

        await user.save();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH Profile Error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
