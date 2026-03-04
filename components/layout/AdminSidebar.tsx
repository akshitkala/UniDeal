"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();
    const superadmin = true; // Placeholder for role check

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
            <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--ink-4)", letterSpacing: "0.12em", marginBottom: 12, paddingLeft: 8, fontWeight: 600 }}>MODERATION</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
                {[
                    { href: "/admin", icon: "📋", label: "Pending Queue" },
                    { href: "/admin/listings", icon: "📦", label: "All Listings" },
                    { href: "/admin/reports", icon: "⚑", label: "Reports" },
                    { href: "/admin/users", icon: "👥", label: "Users" },
                    { href: "/admin/categories", icon: "🏷", label: "Categories" },
                ].map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                            borderRadius: "var(--r)", textDecoration: "none",
                            background: isActive ? "var(--bg-2)" : "transparent",
                            color: "var(--ink)", fontWeight: isActive ? 600 : 400,
                            fontSize: 14
                        }}>
                            <span>{item.icon}</span>
                            <span style={{ flex: 1 }}>{item.label}</span>
                        </Link>
                    )
                })}
            </div>

            {superadmin && (
                <>
                    <div style={{ height: 1, background: "var(--border-2)", marginBottom: 24, marginLeft: 8, marginRight: 8 }} />
                    <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--ink-4)", letterSpacing: "0.12em", marginBottom: 12, paddingLeft: 8, fontWeight: 600 }}>SYSTEM</div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                        {[
                            { href: "/super-admin/activity", icon: "📜", label: "Activity Log" },
                            { href: "/super-admin/config", icon: "⚙", label: "System Config" },
                        ].map(item => {
                            const isActive = pathname.startsWith(item.href);
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
                </>
            )}
        </aside>
    );
}
