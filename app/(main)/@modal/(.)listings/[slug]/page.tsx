import { connectDB } from '@/lib/db/connect';
import { Listing } from '@/models/Listing';
import { User } from '@/models/User';
import { Category } from '@/models/Category';
import '@/models/Listing';
import '@/models/Category';
import '@/models/User';
import ListingDetailDrawer from '@/components/listing/ListingDetailDrawer';

export default async function InterceptedListingPage({
    params,
}: {
    params: { slug: string };
}) {
    await connectDB();

    const listing = await Listing.findOne({ slug: params.slug })
        .populate('category', 'name icon slug')
        .populate('seller', 'displayName uid photoURL')
        .lean();

    if (!listing) return null;

    return (
        <ListingDetailDrawer
            listing={JSON.parse(JSON.stringify(listing))}
        />
    );
}
