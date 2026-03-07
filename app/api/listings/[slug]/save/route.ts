import { requireAuth } from '@/middleware/auth';
import { User } from '@/models/User';
import { Listing } from '@/models/Listing';
import { connectDB } from '@/lib/db/connect';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    await connectDB();
    const authRes = await requireAuth();
    if (authRes instanceof NextResponse) return authRes;

    const { slug } = await params;
    const listing = await Listing.findOne({ slug, isDeleted: false });
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const user = await User.findOne({ uid: authRes.uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const alreadySaved = user.savedListings.some((id: any) => id.toString() === listing._id.toString());

    if (alreadySaved) {
        user.savedListings = user.savedListings.filter(
            (id: any) => id.toString() !== listing._id.toString()
        );
    } else {
        user.savedListings.push(listing._id);
    }

    await user.save();

    return NextResponse.json({ saved: !alreadySaved });
}
