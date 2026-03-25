import { Listing } from '@/models/Listing';
import { User } from '@/models/User';

export const ListingRepository = {
    async findPaginated(filters: Record<string, any>, page: number, limit: number) {
        const skip = (page - 1) * limit;
        const [listings, total] = await Promise.all([
            Listing.find(filters)
                .select('title price images condition slug category createdAt campus seller status')
                .populate('seller', 'displayName photoUrl uid')
                .populate('category', 'name slug icon')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Listing.countDocuments(filters),
        ]);
        return {
            listings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        };
    },

    async findBySlug(slug: string, userId?: string) {
        const [listing, user] = await Promise.all([
            Listing.findOne({ slug })
                .select('-__v')
                .populate('seller', 'displayName photoUrl uid phone whatsapp emailVerified role')
                .populate('category', 'name slug icon')
                .lean(),
            userId
                ? User.findOne({ uid: userId }).select("savedListings").lean()
                : Promise.resolve(null),
        ]);

        if (!listing) return null;
        const isSaved = user?.savedListings?.some((id: any) => id.toString() === (listing as any)._id.toString());
        return { ...listing, isSaved: !!isSaved };
    },

    async findPending() {
        return Listing.find({ status: 'pending' })
            .select('title price images condition slug category createdAt seller status')
            .populate('seller', 'displayName email uid')
            .populate('category', 'name slug')
            .sort({ createdAt: 1 })
            .lean();
    },

    async findByUser(userId: string, status?: string) {
        const query: Record<string, any> = { seller: userId };
        if (status) query.status = status;
        return Listing.find(query)
            .select('title price images condition slug status createdAt')
            .populate('category', 'name icon slug')
            .sort({ createdAt: -1 })
            .lean();
    },

    async approve(id: string) {
        return Listing.findByIdAndUpdate(
            id,
            { $set: { status: 'approved' } }, // Using 'approved' as per schema
            { new: true }
        ).lean();
    },

    async reject(id: string, reason?: string) {
        return Listing.findByIdAndUpdate(
            id,
            { $set: { status: 'rejected', rejectionReason: reason } },
            { new: true }
        ).lean();
    },
};
