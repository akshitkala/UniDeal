"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useSell } from "@/components/listing/SellProvider";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import SellModal from "@/components/listing/SellModal";

const TABS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Sold', value: 'sold' },
    { label: 'Expired', value: 'expired' },
];

type Tab = string; // TABS[number]['value']

export default function DashboardPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>('all');
    const { user, loading: authLoading } = useAuth();
    const { openSellModal } = (useSell() || {}) as any;
    const router = useRouter();

    const [editModal, setEditModal] = useState<{ open: boolean, data?: any }>({ open: false });

    async function handleRelist(slug: string) {
        const confirmed = confirm('Resubmit this listing for review?');
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/listings/${slug}/relist`, { method: 'POST' });
            if (res.ok) {
                // update listing status to pending in local state
                setListings(prev =>
                    prev.map(l => l.slug === slug ? { ...l, status: 'pending', rejectionReason: null } : l)
                );
            } else {
                const data = await res.json();
                alert(data.error || "Failed to relist");
            }
        } catch (err) {
            alert("Something went wrong");
        }
    }

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
        if (!authLoading && !user) {
            router.push('/login?returnTo=/dashboard');
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (user) fetchListings();
    }, [user]);

    const handleMarkSold = async (slug: string) => {
        const confirmed = confirm('Mark this listing as sold?');
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/listings/${slug}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "sold" }),
            });

            if (!res.ok) throw new Error("Action failed");

            setListings(prev => prev.map(l => l.slug === slug ? { ...l, status: "sold" } : l));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (slug: string) => {
        const confirmed = confirm('Delete this listing? This cannot be undone.');
        if (!confirmed) return;

        try {
            const res = await fetch(`/api/listings/${slug}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Delete failed");

            setListings(prev => prev.filter(l => l.slug !== slug));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filtered = tab === 'all' ? listings : listings.filter(l => {
        if (tab === 'active') return l.status === 'approved' && !l.isExpired;
        if (tab === 'expired') return l.isExpired;
        return l.status === tab;
    });

    const tabCount = (t: Tab) => {
        if (t === 'all') return listings.length;
        if (t === 'active') return listings.filter(l => l.status === 'approved' && !l.isExpired).length;
        if (t === 'expired') return listings.filter(l => l.isExpired).length;
        return listings.filter(l => l.status === t).length;
    };

    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    return (
        <div style={{
            padding: isMobile ? "24px 16px 80px" : "40px 20px",
            maxWidth: 1000,
            margin: "0 auto",
            minHeight: "100dvh"
        }}>
            <header style={{
                marginBottom: isMobile ? 24 : 32,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "flex-end",
                gap: 16
            }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 28 : 32, fontWeight: 700, marginBottom: 4 }}>My Dashboard</h1>
                    <p style={{ color: "var(--ink-4)", fontSize: 13 }}>Manage your campus listings.</p>
                </div>
            </header>

            {/* Status Tabs */}
            <div className="no-scrollbar" style={{
                display: 'flex',
                gap: 0,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                borderBottom: '1px solid var(--border-2)',
                background: 'var(--surface)',
                position: 'sticky',
                top: "calc(var(--topbar-h, 64px))",
                zIndex: 90,
                WebkitOverflowScrolling: 'touch',
                margin: isMobile ? "0 -16px 24px" : "0 0 24px",
                padding: isMobile ? "0 16px" : "0"
            }}>
                {TABS.map(t => (
                    <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        style={{
                            padding: '12px 20px',
                            border: 'none',
                            borderBottom: tab === t.value
                                ? '2px solid var(--ink)'
                                : '2px solid transparent',
                            background: 'none',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 14,
                            fontWeight: tab === t.value ? 700 : 400,
                            color: tab === t.value ? 'var(--ink)' : 'var(--ink-4)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 150ms',
                        }}
                    >
                        {t.label}
                        {tabCount(t.value) > 0 && (
                            <span style={{
                                marginLeft: 6,
                                background: tab === t.value ? 'var(--ink)' : 'var(--bg-3)',
                                color: tab === t.value ? '#fff' : 'var(--ink-4)',
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 99,
                            }}>{tabCount(t.value)}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 80, color: "var(--ink-4)" }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: 12 }}>Loading your shop...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--bg-2)", borderRadius: "var(--r-lg)", border: "2px dashed var(--border-2)" }}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filtered.map((l) => (
                        <React.Fragment key={l._id}>
                            <div style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border-2)",
                                borderRadius: "var(--r-md)",
                                padding: isMobile ? 12 : 16,
                                display: "flex",
                                flexDirection: isMobile ? "column" : "row",
                                gap: isMobile ? 12 : 20,
                                alignItems: isMobile ? "stretch" : "center",
                                marginBottom: l.status === 'rejected' ? 0 : 4
                            }}>
                                <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
                                    <div style={{ position: "relative", width: isMobile ? 64 : 80, height: isMobile ? 64 : 80, borderRadius: "var(--r)", overflow: "hidden", flexShrink: 0 }}>
                                        <Image src={l.images[0] || "/placeholder.png"} alt="" fill style={{ objectFit: "cover" }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>₹{l.price?.toLocaleString("en-IN")}</span>
                                            <span style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase" }}>• {l.category?.name}</span>
                                        </div>
                                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</h3>
                                        <div style={{ display: "flex", gap: 12, fontSize: 10, color: "var(--ink-4)", flexWrap: "wrap" }}>
                                            {!isMobile && <span>📅 {new Date(l.createdAt).toLocaleDateString()}</span>}
                                            <span style={{
                                                color: l.isExpired ? "var(--red)" : l.status === "approved" ? "var(--green)" : l.status === "pending" ? "var(--amber)" : "var(--ink-4)",
                                                fontWeight: 700, textTransform: "uppercase", fontSize: 9
                                            }}>
                                                {l.isExpired ? "EXPIRED" : l.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    display: "flex",
                                    gap: 8,
                                    flexShrink: 0,
                                    borderTop: isMobile ? "1px solid var(--border-2)" : "none",
                                    paddingTop: isMobile ? 12 : 0,
                                    justifyContent: isMobile ? "stretch" : "flex-end",
                                    flexWrap: 'wrap'
                                }}>
                                    {/* Edit — active, pending, rejected */}
                                    {['active', 'pending', 'rejected', 'approved'].includes(l.status) && !l.isExpired && (
                                        <button
                                            onClick={() => setEditModal({ open: true, data: { ...l, category: l.category?._id || l.category } })}
                                            style={{
                                                padding: '7px 14px',
                                                border: '1.5px solid var(--border-2)',
                                                borderRadius: 'var(--r)',
                                                background: 'transparent',
                                                fontSize: 13, fontWeight: 600,
                                                cursor: 'pointer',
                                                color: 'var(--ink-2)',
                                            }}
                                        >✏️ Edit</button>
                                    )}

                                    {/* Mark as sold — active/approved only */}
                                    {(l.status === 'active' || l.status === 'approved') && !l.isExpired && (
                                        <button
                                            onClick={() => handleMarkSold(l.slug)}
                                            style={{ padding: '7px 14px', borderRadius: 'var(--r)', border: '1.5px solid var(--border-2)', background: 'var(--surface)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            ✅ Mark Sold
                                        </button>
                                    )}

                                    {/* Re-list — rejected only */}
                                    {l.status === 'rejected' && (
                                        <button
                                            onClick={() => handleRelist(l.slug)}
                                            style={{
                                                padding: '7px 14px',
                                                border: 'none',
                                                borderRadius: 'var(--r)',
                                                background: 'var(--amber)',
                                                color: '#fff',
                                                fontSize: 13, fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >🔄 Re-list</button>
                                    )}

                                    {/* Delete — all statuses */}
                                    <button
                                        onClick={() => handleDelete(l.slug)}
                                        style={{ padding: '7px 14px', borderRadius: 'var(--r)', border: 'none', background: 'var(--red-bg)', color: 'var(--red)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            </div>

                            {l.status === 'rejected' && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: 'var(--r)',
                                    padding: '10px 14px',
                                    fontSize: 13,
                                    color: '#b91c1c',
                                    marginTop: -8,
                                    marginBottom: 16,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 8,
                                }}>
                                    <span>⚠️</span>
                                    <div>
                                        <div style={{ fontWeight: 700, marginBottom: 2 }}>Listing Rejected</div>
                                        <div>{l.rejectionReason ?? 'Does not meet community guidelines.'}</div>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {editModal.open && (
                <SellModal
                    isOpen={editModal.open}
                    onClose={() => setEditModal({ open: false })}
                    mode="edit"
                    initialData={editModal.data}
                    onSuccess={(updated) => {
                        setListings(prev => prev.map(l => l.slug === updated.slug ? { ...l, ...updated } : l));
                    }}
                />
            )}
        </div>
    );
}

