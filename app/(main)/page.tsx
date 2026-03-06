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

import SortSelect from "@/components/listing/SortSelect";

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
        price_desc: { price: -1 },
        most_viewed: { views: -1 }
    };

    const listings = await Listing.find(query)
        .sort(sortMap[searchParams.sort || "newest"])
        .limit(50)
        .populate("category", "name icon slug")
        .populate("seller", "displayName uid");

    if (listings.length === 0) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "80px 20px", color: "var(--ink-4)"
            }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-2)" }}>No listings found</div>
                <p style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your filters or search terms.</p>
                <Link href="/" style={{
                    marginTop: 20, color: "var(--amber)", textDecoration: "none",
                    fontWeight: 600, fontSize: 14
                }}>
                    Clear all filters
                </Link>
            </div>
        );
    }

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
            padding: "0 20px 40px"
        }}>
            {listings.map(l => {
                const listingObj = JSON.parse(JSON.stringify(l));
                listingObj.isSaved = savedIds.includes(l._id.toString());
                return (
                    <ListingCard
                        key={l._id}
                        listing={listingObj}
                    />
                );
            })}
        </div>
    );
}

import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";

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
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
            {/* Filter Row */}
            <div style={{
                position: "sticky", top: 0, zIndex: 10, background: "var(--bg)",
                padding: "16px 20px", display: "flex", justifyContent: "space-between",
                alignItems: "center", borderBottom: "1px solid var(--border-2)",
                flexWrap: "wrap", gap: 12
            }}>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                    {["all", "new", "like-new", "good", "used", "damaged"].map(c => {
                        const active = (params.condition || "all") === c;
                        return (
                            <Link
                                key={c}
                                href={{ query: { ...params, condition: c === "all" ? undefined : c } }}
                                style={{
                                    padding: "6px 14px", borderRadius: 100, fontSize: 12,
                                    textTransform: "capitalize", textDecoration: "none",
                                    background: active ? "var(--ink)" : "var(--surface)",
                                    color: active ? "white" : "var(--ink-2)",
                                    border: `1.5px solid ${active ? "var(--ink)" : "var(--border-2)"}`,
                                    fontWeight: active ? 600 : 500,
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {c.replace("-", " ")}
                            </Link>
                        )
                    })}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <SortSelect />
                </div>
            </div>

            <div style={{ padding: "20px 20px 8px", color: "var(--ink-4)", fontSize: 12, fontWeight: 500 }}>
                {/* Result count would be here */}
            </div>

            <Suspense fallback={
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: 20, padding: "0 20px 40px"
                }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                </div>
            }>
                <ListingsGrid searchParams={params} userUid={userUid} />
            </Suspense>
        </div>
    );
}
