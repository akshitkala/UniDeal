"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSell } from "@/components/listing/SellProvider";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Sidebar() {
    const pathname = usePathname();
    const { openSellModal } = useSell();
    // Using query params makes it tricky with just usePathname.
    // In a real implementation we would use useSearchParams() for ?.category= matching.
    // We'll approximate for now or handle via client state later.

    const { user } = useAuth();
    const isEmailVerified = user?.emailVerified || false;

    return (
        <aside
            style={{
                width: 240,
                height: "100%",
                background: "var(--surface)",
                borderRight: "1px solid var(--border-2)",
                position: "sticky",
                top: 60,
                overflowY: "auto",
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <button
                onClick={openSellModal}
                style={{
                    width: "100%", background: "var(--amber)", color: "white",
                    border: "none", padding: "12px", borderRadius: "var(--r)",
                    fontWeight: 600, fontSize: 14, marginBottom: 20, cursor: "pointer",
                    fontFamily: "var(--font-sans)"
                }}
            >
                List Item
            </button>

            <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--ink-4)", letterSpacing: "0.12em", marginBottom: 12, paddingLeft: 8, fontWeight: 600 }}>BROWSE</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
                {[
                    { href: "/", icon: "🏠", label: "All Listings" },
                    { href: "/?category=books-notes", icon: "📚", label: "Books & Notes" },
                    { href: "/?category=electronics", icon: "💻", label: "Electronics" },
                    { href: "/?category=furniture", icon: "🪑", label: "Furniture" },
                    { href: "/?category=clothing", icon: "👕", label: "Clothing" },
                    { href: "/?category=sports-fitness", icon: "⚽", label: "Sports & Fitness" },
                    { href: "/?category=miscellaneous", icon: "📦", label: "Miscellaneous" },
                ].map(item => {
                    // Simplistic active check
                    const isActive = pathname === "/" && item.href === "/" // Default empty state fallback check should be improved
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                            borderRadius: "var(--r)", textDecoration: "none",
                            background: isActive ? "var(--bg-2)" : "transparent",
                            color: "var(--ink)", fontWeight: isActive ? 600 : 400,
                            fontSize: 14
                        }}>
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                })}
            </div>

            <div style={{ height: 1, background: "var(--border-2)", marginBottom: 24, marginLeft: 8, marginRight: 8 }} />

            <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--ink-4)", letterSpacing: "0.12em", marginBottom: 12, paddingLeft: 8, fontWeight: 600 }}>MY ACCOUNT</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                {[
                    { href: "/dashboard", icon: "≡", label: "My Listings" },
                    { href: "/saved", icon: "🔖", label: "Saved" },
                    { href: "/profile", icon: "👤", label: "Profile" },
                ].map(item => (
                    <Link key={item.href} href={item.href} style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                        borderRadius: "var(--r)", textDecoration: "none",
                        background: pathname.startsWith(item.href) ? "var(--bg-2)" : "transparent",
                        color: "var(--ink)", fontWeight: pathname.startsWith(item.href) ? 600 : 400,
                        fontSize: 14
                    }}>
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </div>

            {!isEmailVerified && (
                <div style={{
                    marginTop: "auto", background: "var(--amber-bg)", border: "1px solid #fde68a",
                    padding: 12, borderRadius: "var(--r)", fontSize: 12, color: "var(--amber-dim)",
                    lineHeight: 1.4
                }}>
                    📧 Verify your email to post and contact sellers.
                </div>
            )}
        </aside>
    );
}
