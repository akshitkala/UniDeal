"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useSell } from "@/components/listing/SellProvider";
import { useRouter } from "next/navigation";

const TABS = ['all', 'active', 'pending', 'rejected', 'sold', 'expired'] as const;
type Tab = typeof TABS[number];

export default function DashboardPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('all');
    const { user, loading: authLoading } = useAuth();
    const { openSellModal } = useSell();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?returnTo=/dashboard');
        }
    }, [user, authLoading]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/user/listings");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load listings");
            setListings(data.listings);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchListings();
    }, [user]);

    const handleStatusChange = async (slug: string, action: "sold" | "delete") => {
        if (!confirm(`Are you sure you want to ${action === "delete" ? "remove" : "mark as sold"} this listing?`)) return;

        try {
            const res = await fetch(`/api/listings/${slug}`, {
                method: action === "delete" ? "DELETE" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: action === "sold" ? JSON.stringify({ status: "sold" }) : undefined,
            });

            if (!res.ok) throw new Error("Action failed");
            fetchListings();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filtered = tab === 'all' ? listings : listings.filter(l => {
        if (tab === 'active')   return l.status === 'approved' && !l.isExpired;
        if (tab === 'expired')  return l.isExpired;
        return l.status === tab;
    });

    const tabCount = (t: Tab) => {
        if (t === 'all')     return listings.length;
        if (t === 'active')  return listings.filter(l => l.status === 'approved' && !l.isExpired).length;
        if (t === 'expired') return listings.filter(l => l.isExpired).length;
        return listings.filter(l => l.status === t).length;
    };

    return (
        <div style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto" }}>
            <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>My Dashboard</h1>
                    <p style={{ color: "var(--ink-4)", fontSize: 14 }}>Manage your campus listings.</p>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700, textTransform: "uppercase" }}>TOTAL VIEWS</div>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{listings.reduce((acc, curr) => acc + (curr.views || 0), 0)}</div>
                </div>
            </header>

            {/* Status Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 24, borderBottom: "1px solid var(--border-2)", overflowX: "auto" }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: "8px 14px", background: "none", border: "none",
                        borderBottom: tab === t ? "2px solid var(--ink)" : "2px solid transparent",
                        fontWeight: tab === t ? 700 : 400, fontSize: 13,
                        color: tab === t ? "var(--ink)" : "var(--ink-4)",
                        cursor: "pointer", textTransform: "capitalize", whiteSpace: "nowrap",
                    }}>
                        {t} ({tabCount(t)})
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 80, color: "var(--ink-4)" }}>Loading your shop...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--bg-2)", borderRadius: "var(--r-lg)", border: "2px dashed var(--border-2)" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🛍</div>
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>{tab === 'all' ? 'No listings yet' : `No ${tab} listings`}</h2>
                    <p style={{ color: "var(--ink-4)", fontSize: 14, marginTop: 4 }}>
                        {tab === 'all' ? 'Time to declutter your room!' : 'Nothing in this category.'}
                    </p>
                    {tab === 'all' && (
                        <button
                            onClick={openSellModal}
                            style={{ marginTop: 20, padding: "12px 24px", background: "var(--amber)", color: "white", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer" }}
                        >
                            Post Your First Item
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {filtered.map((l) => (
                        <div key={l._id} style={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: "var(--r-md)", padding: 16, display: "flex", gap: 20, alignItems: "center" }}>
                            <div style={{ position: "relative", width: 80, height: 80, borderRadius: "var(--r)", overflow: "hidden", flexShrink: 0 }}>
                                <Image src={l.images[0] || "/placeholder.png"} alt="" fill style={{ objectFit: "cover" }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)" }}>₹{l.price?.toLocaleString("en-IN")}</span>
                                    <span style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase" }}>• {l.category?.name}</span>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</h3>
                                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--ink-4)", flexWrap: "wrap" }}>
                                    <span>👁 {l.views} views</span>
                                    <span>📅 {new Date(l.createdAt).toLocaleDateString()}</span>
                                    <span style={{
                                        color: l.isExpired ? "var(--red)" : l.status === "approved" ? "var(--green)" : l.status === "pending" ? "var(--amber)" : "var(--ink-4)",
                                        fontWeight: 700, textTransform: "uppercase",
                                    }}>
                                        {l.isExpired ? "EXPIRED" : l.status}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                {l.status !== "sold" && !l.isExpired && (
                                    <button
                                        onClick={() => handleStatusChange(l.slug, "sold")}
                                        style={{ padding: "8px 16px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", background: "var(--surface)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                    >
                                        Mark Sold
                                    </button>
                                )}
                                <button
                                    onClick={() => handleStatusChange(l.slug, "delete")}
                                    style={{ padding: "8px 16px", borderRadius: "var(--r)", border: "none", background: "var(--red-bg)", color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
