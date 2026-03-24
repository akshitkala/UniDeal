"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSell } from "@/components/listing/SellProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export default function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
    const sell = useSell();
    const { user, logout } = useAuth();
    const breakpoint = useBreakpoint();

    const isMobile = breakpoint === "mobile";

    const handleListItem = () => {
        if (!user) {
            router.push("/login?returnTo=/");
            return;
        }
        sell?.openSellModal();
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get("search") as string;
        if (search) {
            router.push(`/?search=${encodeURIComponent(search)}`);
        } else {
            router.push("/");
        }
    };

    return (
        <header
            style={{
                height: 60,
                background: "var(--surface)",
                borderBottom: "1px solid var(--border-2)",
                position: "sticky",
                top: 0,
                zIndex: 200,
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px"
            }}
        >
            {/* LEFT ZONE */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {isMobile && (
                    <button
                        onClick={onOpenMenu}
                        style={{
                            background: "none", border: "none", fontSize: 24, cursor: "pointer", padding: "8px", marginLeft: -8,
                            display: "flex", alignItems: "center", justifyContent: "center"
                        }}
                    >
                        ☰
                    </button>
                )}
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, width: isMobile ? "auto" : 200 }}>
                    <div style={{
                        width: 34, height: 34, background: "var(--ink)", borderRadius: 9,
                        display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16
                    }}>
                        🏷
                    </div>
                    {!isMobile && (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 18, color: "var(--ink)", lineHeight: 1 }}>UniDeal</span>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: 9, color: "var(--ink-4)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>LPU Campus</span>
                        </div>
                    )}
                </Link>
            </div>

            {/* CENTRE */}
            {!isMobile && (
                <div style={{ flex: 1, maxWidth: 520, margin: "0 auto" }}>
                    <form onSubmit={handleSearch} style={{
                        display: "flex", alignItems: "center", background: "var(--bg)", border: "1.5px solid var(--border-2)",
                        borderRadius: "var(--r-md)", padding: "0 12px", height: 40
                    }}>
                        <span style={{ fontSize: 16, marginRight: 8, color: "var(--ink-4)" }}>🔍</span>
                        <input
                            name="search"
                            type="text"
                            placeholder="Search listings..."
                            style={{
                                flex: 1, background: "transparent", border: "none", outline: "none",
                                color: "var(--ink)", fontSize: 14, fontFamily: "var(--font-sans)"
                            }}
                        />
                    </form>
                </div>
            )}

            {isMobile && (
                <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 17, color: "var(--ink)", lineHeight: 1 }}>UniDeal</span>
                </div>
            )}

            {/* RIGHT ZONE */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 10 }}>
                {isMobile ? (
                    <button
                        onClick={() => setSearchOverlayOpen(true)}
                        style={{
                            width: 36, height: 36, borderRadius: "50%", background: "none",
                            border: "none", display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer", fontSize: 18
                        }}
                    >
                        🔍
                    </button>
                ) : (
                    <button
                        onClick={handleListItem}
                        style={{
                            background: "var(--primary)", color: "white", border: "none",
                            fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13,
                            borderRadius: "var(--r)", padding: "8px 16px", cursor: "pointer"
                        }}
                    >
                        List Item
                    </button>
                )}

                {!isMobile && (
                    <button style={{
                        width: 36, height: 36, borderRadius: "50%", background: "var(--bg)",
                        border: "1px solid var(--border-2)", display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer", fontSize: 16
                    }}>
                        🔔
                    </button>
                )}

                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => {
                            if (user) {
                                setDropdownOpen(!dropdownOpen);
                            } else {
                                router.push("/login");
                            }
                        }}
                        style={{
                            width: 34, height: 34, borderRadius: "50%", background: "var(--ink)",
                            color: "white", border: "none", fontWeight: 600, display: "flex",
                            alignItems: "center", justifyContent: "center", cursor: "pointer",
                            overflow: "hidden"
                        }}
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="avatar" width={34} height={34} style={{ borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--ink)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
                                {user?.displayName?.[0]?.toUpperCase() ?? "U"}
                            </div>
                        )}
                    </button>

                    {dropdownOpen && (
                        <div style={{
                            position: "absolute", top: 44, right: 0, width: 160, background: "var(--surface)",
                            border: "1px solid var(--border-2)", borderRadius: "var(--r)", boxShadow: "var(--shadow-md)",
                            display: "flex", flexDirection: "column", overflow: "hidden",
                            animation: "fadeUp 0.3s var(--ease)"
                        }}>
                            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-2)", fontSize: 11, color: "var(--ink-4)" }}>
                                Signed in as <b>{user?.displayName || "User"}</b>
                            </div>
                            <Link href="/dashboard" onClick={() => setDropdownOpen(false)} style={{ padding: "10px 16px", textDecoration: "none", color: "var(--ink)", fontSize: 14, borderBottom: "1px solid var(--border-2)" }}>My Listings</Link>
                            <Link href="/profile" onClick={() => setDropdownOpen(false)} style={{ padding: "10px 16px", textDecoration: "none", color: "var(--ink)", fontSize: 14, borderBottom: "1px solid var(--border-2)" }}>Profile</Link>
                            <button
                                onClick={() => { logout(); setDropdownOpen(false); }}
                                style={{ padding: "10px 16px", background: "none", border: "none", textAlign: "left", color: "var(--red)", fontSize: 14, cursor: "pointer", fontWeight: 600 }}
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* SEARCH OVERLAY */}
            {searchOverlayOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "var(--surface)", zIndex: 1000, display: "flex", flexDirection: "column",
                    animation: "fadeIn 0.2s ease-out"
                }}>
                    <header style={{ height: 60, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, borderBottom: "1px solid var(--border-2)" }}>
                        <button onClick={() => setSearchOverlayOpen(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>←</button>
                        <form onSubmit={(e) => { handleSearch(e); setSearchOverlayOpen(false); }} style={{ flex: 1 }}>
                            <input
                                autoFocus
                                name="search"
                                type="text"
                                placeholder="Search UniDeal..."
                                style={{ width: "100%", background: "none", border: "none", outline: "none", fontSize: 16, fontFamily: "var(--font-sans)" }}
                            />
                        </form>
                    </header>
                </div>
            )}
        </header>
    );
}
