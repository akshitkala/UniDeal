import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { TokenPayload } from "@/lib/auth/jwt";
import { User } from "@/models/User";
import { requireAuth } from "@/middleware/auth";
import { UserRepository } from '@/lib/db/repositories/user.repository';
import { ListingRepository } from '@/lib/db/repositories/listing.repository';

export async function GET(req: NextRequest) {
    try {
        const user = await requireAuth();
        if (user instanceof NextResponse) return user;

        await connectDB();
        
        const [profile, listings] = await Promise.all([
            UserRepository.findByUid(user.uid),
            ListingRepository.findByUser(user._id.toString())
        ]);

        if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({
            user: profile,
            listings
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
        const [body, user] = await Promise.all([
            req.json(),
            User.findOne({ uid: tokenUser.uid })
        ]);
        const { displayName, bio, location, phone, whatsappNumber } = body;
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
