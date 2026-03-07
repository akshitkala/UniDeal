import { Suspense } from "react";
import { connectDB } from "@/lib/db/connect";
import { Listing } from "@/models/Listing";
import { Category } from "@/models/Category";
import { User } from "@/models/User";
import ListingCard from "@/components/listing/ListingCard";
import SkeletonCard from "@/components/listing/SkeletonCard";
import '@/models/Listing';
import '@/models/Category';
import '@/models/User';
import Link from "next/link";

export const revalidate = 60; // Revalidate every minute

import ListingsInfiniteGrid from "@/components/listing/ListingsInfiniteGrid";
import EmptyStateHome from "@/components/listing/EmptyStateHome";

async function ListingsGrid({
    searchParams,
    userUid
}: {
    searchParams: { category?: string; condition?: string; sort?: string; search?: string };
    userUid?: string;
}) {
    await connectDB();

    let savedIds: string[] = [];
    if (userUid) {
        const user = await User.findOne({ uid: userUid }).select("savedListings");
        if (user) {
            savedIds = user.savedListings.map((id: any) => id.toString());
        }
    }

    const query: any = { status: "approved", isExpired: false, isDeleted: false };

    if (searchParams.category) {
        const cat = await Category.findOne({ slug: searchParams.category });
        if (cat) query.category = cat._id;
    }

    if (searchParams.condition && searchParams.condition !== "all") {
        query.condition = searchParams.condition;
    }

    if (searchParams.search) {
        query.title = { $regex: searchParams.search, $options: "i" };
    }

    const sortMap: any = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        price_asc: { price: 1 },
        price_desc: { price: -1 }
    };

    const listings = await Listing.find(query)
        .sort(sortMap[searchParams.sort || "newest"])
        .limit(12) // Initial load limit
        .populate("category", "name icon slug")
        .populate("seller", "displayName uid");

    if (listings.length === 0) {
        const isFilterActive = !!(searchParams.category || searchParams.condition || searchParams.search);
        return <EmptyStateHome type={isFilterActive ? 'no-results' : 'no-listings'} />;
    }

    const initialListings = JSON.parse(JSON.stringify(listings)).map((l: any) => ({
        ...l,
        isSaved: savedIds.includes(l._id.toString())
    }));

    return (
        <ListingsInfiniteGrid
            initialListings={initialListings}
            searchParams={searchParams}
            savedIds={savedIds}
        />
    );
}

import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import BrowsePageClient from "@/components/listing/BrowsePageClient";

export default async function BrowsePage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; condition?: string; sort?: string; search?: string }>
}) {
    const params = await searchParams;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    let userUid: string | undefined;

    if (token) {
        try {
            const payload = verifyAccessToken(token);
            userUid = payload.uid;
        } catch (e) { }
    }

    return (
        <BrowsePageClient params={params} userUid={userUid}>
            <ListingsGrid searchParams={params} userUid={userUid} />
        </BrowsePageClient>
    );
}
