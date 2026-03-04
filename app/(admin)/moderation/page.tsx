"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ModerationPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            const res = await fetch("/api/admin/moderation");
            const data = await res.json();
            if (res.ok) setReports(data.reports);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleAction = async (reportId: string, listingId: string, action: "resolve" | "dismiss") => {
        if (!confirm(`Are you sure you want to ${action === "resolve" ? "delete listing & resolve" : "dismiss"} this report?`)) return;

        try {
            // 1. Update listing status if resolved (delete)
            if (action === "resolve") {
                await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
            }

            // 2. Update report status
            const status = action === "resolve" ? "resolved" : "dismissed";
            await fetch(`/api/admin/moderation/${reportId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            fetchReports();
        } catch (error) {
            alert("Action failed");
        }
    };

    return (
        <div style={{ padding: 40 }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, marginBottom: 8 }}>Moderation Desk</h1>
            <p style={{ color: "var(--ink-4)", marginBottom: 32 }}>Handle community reports and flagged content.</p>

            {loading ? (
                <div>Loading queue...</div>
            ) : reports.length === 0 ? (
                <div style={{ padding: 80, textAlign: "center", background: "var(--bg-2)", borderRadius: "var(--r)" }}>
                    All clear! No pending reports.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {reports.map((r) => (
                        <div key={r._id} style={{ background: "white", padding: 20, borderRadius: "var(--r-md)", border: "1px solid var(--border-2)", display: "flex", gap: 24 }}>
                            <div style={{ width: 100, height: 100, position: "relative", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                                <Image src={r.listing?.images?.[0] || "/placeholder.png"} alt="" fill style={{ objectFit: "cover" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", marginBottom: 4 }}>
                                    Report: {r.reason}
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{r.listing?.title}</h3>
                                <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 12 }}>{r.listing?.description?.substring(0, 100)}...</p>
                                <div style={{ fontSize: 12, color: "var(--ink-4)" }}>
                                    By: {r.reporter?.displayName} • On: {new Date(r.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                                <button
                                    onClick={() => handleAction(r._id, r.listing?._id, "resolve")}
                                    style={{ padding: "10px 20px", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer" }}
                                >
                                    Remove Item
                                </button>
                                <button
                                    onClick={() => handleAction(r._id, r.listing?._id, "dismiss")}
                                    style={{ padding: "10px 20px", background: "var(--bg-2)", color: "var(--ink)", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer" }}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
