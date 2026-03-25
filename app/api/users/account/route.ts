import { connectDB } from '@/lib/db/connect';
import { requireAuth } from '@/middleware/auth';
import { User } from '@/models/User';
import { Listing } from '@/models/Listing';
import { Report } from '@/models/Report';
import Log from '@/models/Log';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const authResponse = await requireAuth();
  if (authResponse instanceof NextResponse) return authResponse;

  await connectDB();

  const userId = authResponse._id;

  try {
    // 1. Get all listing IDs belonging to this user
    const userListings = await Listing.find({ seller: userId }).select('_id').lean();
    const listingIds = userListings.map(l => (l as any)._id);

    // 2. Delete all reports ON user's listings
    if (listingIds.length > 0) {
      await Report.deleteMany({ listing: { $in: listingIds } });
    }

    // 3. Delete all reports MADE BY this user
    await Report.deleteMany({ reporter: userId });

    // 4. Delete all listings by this user (any status)
    await Listing.deleteMany({ seller: userId });

    // 5. Remove this user's listings from other users' savedListings arrays
    await User.updateMany(
      { savedListings: { $in: listingIds } },
      { $pull: { savedListings: { $in: listingIds } } }
    );

    // 6. Pull this user ID from all other listings' savedBy arrays
    await Listing.updateMany(
      { savedBy: userId },
      { $pull: { savedBy: userId } }
    );

    // 7. Delete all logs involving this user
    await Log.deleteMany({
      $or: [
        { performedBy: userId },
        { targetUser: userId },
      ],
    });

    // 8. Delete the user document itself
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Account deletion error:', err);
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    );
  }
}
