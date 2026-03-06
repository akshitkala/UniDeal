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
    const user = await User.findOne({ uid: userUid }).populate({
        path: "savedListings",
        populate: { path: "category", select: "name icon slug" }
    });

    if (!user || user.savedListings.length === 0) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "80px 20px", color: "var(--ink-4)"
            }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-2)" }}>Nothing saved yet</div>
                <p style={{ fontSize: 14, marginTop: 4 }}>Save items you like to see them here.</p>
                <Link href="/" style={{
                    marginTop: 20, color: "var(--amber)", textDecoration: "none",
                    fontWeight: 600, fontSize: 14
                }}>
                    Browse listings →
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
