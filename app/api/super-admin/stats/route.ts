import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireSuperadmin } from "@/middleware/auth";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import { Report } from "@/models/Report";

export async function GET(req: NextRequest) {
    try {
        const superOrResponse = await requireSuperadmin();
        if (superOrResponse instanceof NextResponse) return superOrResponse;

        await connectDB();

        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const [
            totalListings, activeListings, pendingListings, rejectedListings, expiredListings,
            totalUsers, bannedUsers, adminUsers,
            totalReports, openReports,
            listingsToday, usersToday
        ] = await Promise.all([
            Listing.countDocuments(),
            Listing.countDocuments({ status: "approved", isExpired: false, isDeleted: false }),
            Listing.countDocuments({ status: "pending" }),
            Listing.countDocuments({ status: "rejected" }),
            Listing.countDocuments({ isExpired: true }),
            User.countDocuments(),
            User.countDocuments({ isActive: false }),
            User.countDocuments({ role: { $in: ["admin", "superadmin"] } }),
            Report.countDocuments(),
            Report.countDocuments({ status: "pending" }),
            Listing.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
            User.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } })
        ]);

        return NextResponse.json({
            listings: {
                total: totalListings,
                active: activeListings,
                pending: pendingListings,
                rejected: rejectedListings,
                expired: expiredListings,
            },
            users: {
                total: totalUsers,
                banned: bannedUsers,
                admins: adminUsers,
            },
            reports: {
                total: totalReports,
                open: openReports,
            },
            activity: {
                listingsToday: listingsToday,
                usersToday: usersToday,
            }
        });
    } catch (error) {
        console.error("GET Super-admin Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
