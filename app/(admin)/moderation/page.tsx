"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useBreakpoint } from "@/hooks/useBreakpoint";

function ModerationCard({ r, onAction }: { r: any; onAction: any }) {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    const isAiFlagged = r.listing?.aiFlagged;
    const confidence = r.listing?.aiConfidence || 0;

    const barColor = confidence > 66 ? "#dc2626" : confidence > 33 ? "#d97706" : "#16a34a";

    return (
        <div key={r._id} style={{
            background: isAiFlagged ? "#FEF2F2" : "white",
            padding: isMobile ? 16 : 24,
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border-2)",
            borderLeft: (isAiFlagged && !isMobile) ? "4px solid #B91C1C" : "1px solid var(--border-2)",
            borderTop: (isAiFlagged && isMobile) ? "4px solid #B91C1C" : "1px solid var(--border-2)",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 16 : 24,
            position: "relative"
        }}>
            {isAiFlagged && (
                <div style={{
                    position: "absolute", top: isMobile ? -12 : 8, right: 8,
                    background: "#B91C1C", color: "white", padding: "3px 8px",
                    borderRadius: 4, fontSize: 10, fontWeight: 700, zIndex: 1
                }}>
                    AI FLAGGED
                </div>
            )}

            <div style={{
                width: isMobile ? "100%" : 120,
                height: isMobile ? 200 : 120,
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                flexShrink: 0
            }}>
                <Image src={r.listing?.images?.[0] || "/placeholder.png"} alt="" fill style={{ objectFit: "cover" }} />
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", textTransform: "uppercase", marginBottom: 4 }}>
                    Report: {r.reason}
                </div>
                <h3 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 600, marginBottom: 8 }}>{r.listing?.title}</h3>
                <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 12 }}>{r.listing?.description?.substring(0, 100)}...</p>

                {isAiFlagged && (
                    <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 6, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${confidence}%`, height: "100%", background: barColor }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-4)" }}>AI Confidence: {confidence}%</span>
                    </div>
                )}

                <div style={{ fontSize: 11, color: "var(--ink-4)" }}>
                    By: {r.reporter?.displayName || "System AI"} • On: {new Date(r.createdAt).toLocaleDateString()}
                </div>
            </div>

            <div style={{
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                gap: 8,
                justifyContent: isMobile ? "stretch" : "center",
                borderTop: isMobile ? "1px solid var(--border-2)" : "none",
                paddingTop: isMobile ? 16 : 0
            }}>
                <button
                    onClick={() => onAction(r._id, r.listing?._id, "resolve")}
                    style={{ flex: 1, padding: "12px 20px", background: "var(--red)", color: "white", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
                >
                    Remove Item
                </button>
                <button
                    onClick={() => onAction(r._id, r.listing?._id, "dismiss")}
                    style={{ flex: 1, padding: "12px 20px", background: "var(--bg-2)", color: "var(--ink)", border: "none", borderRadius: "var(--r)", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}

export default function ModerationPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

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
            if (action === "resolve") {
                await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
            }

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
        <div className="full-height" style={{
            padding: isMobile ? "24px 16px 80px" : "40px 24px",
            maxWidth: 1200,
            margin: "0 auto",
        }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 28 : 32, marginBottom: 8, fontWeight: 700 }}>Moderation Desk</h1>
            <p style={{ color: "var(--ink-4)", marginBottom: 32, fontSize: 13 }}>Handle community reports and flagged content.</p>

            {loading ? (
                <div style={{ textAlign: "center", padding: 80, color: "var(--ink-4)" }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: 12 }}>Loading queue...</p>
                </div>
            ) : reports.length === 0 ? (
                <div style={{ padding: 80, textAlign: "center", background: "var(--bg-2)", borderRadius: "var(--r)", border: "2px dashed var(--border-2)" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>All clear!</h2>
                    <p style={{ color: "var(--ink-4)", fontSize: 14 }}>No pending reports to handle.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {reports.map((r) => (
                        <ModerationCard key={r._id} r={r} onAction={handleAction} />
                    ))}
                </div>
            )}
        </div>
    );
}
