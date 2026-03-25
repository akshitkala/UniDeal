import { Suspense } from "react";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { Listing } from "@/models/Listing";
import '@/models/User';
import '@/models/Listing';
import '@/models/Category';
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import ListingCard from "@/components/listing/ListingCard";
import Link from "next/link";
import { redirect } from "next/navigation";

async function SavedListings() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) redirect("/login");

    let userUid: string;
    try {
        const payload = verifyAccessToken(token);
        userUid = payload.uid;
    } catch (e) {
        redirect("/login");
    }

    await connectDB();
    const user = await User.findOne({ uid: userUid })
        .select('savedListings')
        .populate({
            path: "savedListings",
            select: "title price images condition slug category seller status createdAt",
            populate: { path: "category", select: "name icon slug" }
        })
        .lean();

    if (!user || user.savedListings.length === 0) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '64px 24px',
                textAlign: 'center',
            }}>
                <span style={{ fontSize: 48, marginBottom: 16 }}>🔖</span>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>
                    No saved listings
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: '0 0 24px', maxWidth: 260 }}>
                    Tap the bookmark icon on any listing to save it here
                </p>

                <Link
                    href="/"
                    style={{
                        background: '#1a1a1a', color: '#fff',
                        textDecoration: 'none', borderRadius: 12,
                        padding: '12px 24px', fontWeight: 700, fontSize: 14,
                    }}
                >
                    Browse listings
                </Link>
            </div>
        );
    }

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
            padding: "20px"
        }}>
            {user.savedListings.map((l: any) => {
                const listingObj = JSON.parse(JSON.stringify(l));
                listingObj.isSaved = true; // By definition in this page
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

export default function SavedPage() {
    return (
        <div style={{ minHeight: "100%" }}>
            <div style={{
                padding: "24px 20px", borderBottom: "1px solid var(--border-2)",
                background: "var(--surface)"
            }}>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>Saved Listings</h1>
            </div>

            <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Loading your wishlist...</div>}>
                <SavedListings />
            </Suspense>
        </div>
    );
}
