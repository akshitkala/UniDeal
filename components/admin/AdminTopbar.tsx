"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function AdminTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
    const { user } = useAuth();
    
    return (
        <header style={{
            height: 60,
            background: "white",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            position: "sticky",
            top: 0,
            zIndex: 100
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                    onClick={onOpenMenu}
                    style={{
                        background: "none", border: "none", fontSize: 24, cursor: "pointer", 
                        padding: "8px", marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                >
                    ☰
                </button>
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>🛍</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>UniDeal</span>
                </Link>
            </div>

            <div style={{
                width: 34, height: 34, borderRadius: "50%", background: "var(--ink)",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700
            }}>
                {(user?.displayName?.[0] || user?.email?.[0] || "A").toUpperCase()}
            </div>
        </header>
    );
}
