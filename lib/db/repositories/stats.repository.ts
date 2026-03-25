import { Listing } from '@/models/Listing';
import { User } from '@/models/User';
import { Report } from '@/models/Report';

export const StatsRepository = {
    async getPlatformStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [listingStats, userStats, reportStats] = await Promise.all([
            Listing.aggregate([
                {
                    $facet: {
                        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
                        newToday: [{ $match: { createdAt: { $gte: today } } }, { $count: 'count' }],
                    },
                },
            ]),
            User.aggregate([
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        banned: [{ $match: { isActive: false } }, { $count: 'count' }],
                    },
                },
            ]),
            Report.countDocuments({ status: 'pending' }), // Using 'pending' as per schema
        ]);

        const byStatus = listingStats[0]?.byStatus ?? [];
        const getCount = (status: string) =>
            byStatus.find((s: any) => s._id === status)?.count ?? 0;

        return {
            pendingListings:  getCount('pending'),
            activeListings:   getCount('approved'), // Using 'approved' for active listings as per schema
            rejectedListings: getCount('rejected'),
            soldListings:     getCount('sold'),
            totalListings:    byStatus.reduce((sum: number, s: any) => sum + s.count, 0),
            newToday:         listingStats[0]?.newToday?.[0]?.count ?? 0,
            totalUsers:       userStats[0]?.total?.[0]?.count ?? 0,
            bannedUsers:      userStats[0]?.banned?.[0]?.count ?? 0,
            openReports:      reportStats,
        };
    },
};
