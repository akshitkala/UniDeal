"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import { useState, useEffect } from "react";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ listingsCount: 0, viewsCount: 0 });

    useEffect(() => {
        if (user) {
            fetch("/api/user/listings")
                .then(res => res.json())
                .then(data => {
                    if (data.listings) {
                        setStats({
                            listingsCount: data.listings.length,
                            viewsCount: data.listings.reduce((acc: number, curr: any) => acc + (curr.views || 0), 0)
                        });
                    }
                });
        }
    }, [user]);

    if (!user) return (
        <div style={{ padding: 80, textAlign: "center", color: "var(--ink-4)" }}>
            Please <a href="/login">login</a> to view your profile.
        </div>
    );

    return (
        <div style={{ padding: "40px 20px", maxWidth: 600, margin: "0 auto" }}>
            <header style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: "50%", background: "var(--ink)",
                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32, fontWeight: 700, margin: "0 auto 16px", overflow: "hidden"
                }}>
                    {user.photoURL ? <img src={user.photoURL} alt="" width={80} height={80} /> : (user.displayName?.charAt(0) || "U")}
                </div>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{user.displayName}</h1>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
                    {user.emailVerified ? (
                        <span style={{ fontSize: 11, fontWeight: 700, background: "var(--green-bg)", color: "var(--green)", padding: "4px 10px", borderRadius: 100 }}>
                            ✓ VERIFIED STUDENT
                        </span>
                    ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, background: "var(--amber-bg)", color: "var(--amber)", padding: "4px 10px", borderRadius: 100 }}>
                            ⚠ UNVERIFIED
                        </span>
                    )}
                    <span style={{ fontSize: 11, fontWeight: 700, background: "var(--bg-2)", color: "var(--ink-3)", padding: "4px 10px", borderRadius: 100 }}>
                        TRUST LVL 1
                    </span>
                </div>
            </header>

            <section style={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: 24 }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-2)", fontWeight: 600 }}>Account Details</div>
                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <div style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>EMAIL</div>
                        <div style={{ fontSize: 14 }}>{user.email}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>JOINED</div>
                        <div style={{ fontSize: 14 }}>{new Date(user.metadata.creationTime || "").toLocaleDateString()}</div>
                    </div>
                </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: "var(--r-lg)", padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.listingsCount}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 600, textTransform: "uppercase" }}>TOTAL LISTINGS</div>
                </div>
                <div style={{ background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: "var(--r-lg)", padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.viewsCount}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 600, textTransform: "uppercase" }}>TOTAL VIEWS</div>
                </div>
            </div>

            <button
                onClick={logout}
                style={{
                    width: "100%", padding: "14px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)",
                    background: "var(--surface)", color: "var(--red)", fontWeight: 700, cursor: "pointer"
                }}
            >
                Sign Out from Device
            </button>

            <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--ink-4)" }}>
                UniDeal Account ID: {user.uid}
            </p>
        </div>
    );
}
