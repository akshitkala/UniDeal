"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function DashboardPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

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
                body: action === "sold" ? JSON.stringify({ status: "sold" }) : undefined
            });

            if (!res.ok) throw new Error("Action failed");

            // Refresh list
            fetchListings();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto" }}>
            <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>My Dashboard</h1>
                    <p style={{ color: "var(--ink-4)", fontSize: 14 }}>Manage your campus listings and interest.</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700, textTransform: "uppercase" }}>TOTAL VIEWS</div>
                        <div style={{ fontSize: 24, fontWeight: 700 }}>{listings.reduce((acc, curr) => acc + (curr.views || 0), 0)}</div>
                    </div>
                </div>
            </header>

            {loading ? (
                <div style={{ textAlign: "center", padding: 80, color: "var(--ink-4)" }}>Loading your shop...</div>
            ) : listings.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "80px 20px", background: "var(--bg-2)",
                    borderRadius: "var(--r-lg)", border: "2px dashed var(--border-2)"
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🛍</div>
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>No active listings</h2>
                    <p style={{ color: "var(--ink-4)", fontSize: 14, marginTop: 4 }}>Time to declutter your room!</p>
                    <button
                        onClick={() => (window as any).openSellModal?.()}
                        style={{
                            marginTop: 20, padding: "12px 24px", background: "var(--amber)",
                            color: "white", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer"
                        }}
                    >
                        Post Your First Item
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {listings.map((l) => (
                        <div key={l._id} style={{
                            background: "var(--surface)", border: "1px solid var(--border-2)",
                            borderRadius: "var(--r-md)", padding: 16, display: "flex", gap: 20,
                            alignItems: "center"
                        }}>
                            <div style={{ position: "relative", width: 80, height: 80, borderRadius: "var(--r)", overflow: "hidden", flexShrink: 0 }}>
                                <Image src={l.images[0] || "/placeholder.png"} alt="" fill style={{ objectFit: "cover" }} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)" }}>₹{l.price}</span>
                                    <span style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase" }}>• {l.category?.name}</span>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{l.title}</h3>
                                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--ink-4)" }}>
                                    <span>👁 {l.views} views</span>
                                    <span>📅 {new Date(l.createdAt).toLocaleDateString()}</span>
                                    <span style={{
                                        color: l.status === "approved" ? "var(--green)" : l.status === "pending" ? "var(--amber)" : "var(--ink-4)",
                                        fontWeight: 700, textTransform: "uppercase"
                                    }}>
                                        {l.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>
                                {l.status !== "sold" && (
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
