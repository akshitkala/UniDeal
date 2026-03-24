"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSell } from "@/components/listing/SellProvider";

export default function BottomNav() {
    const pathname = usePathname();
    const { openSellModal } = useSell();

    const navItems = [
        { label: "Browse", icon: "🏠", href: "/" },
        { label: "Saved", icon: "🔖", href: "/saved" },
        { label: "Sell", icon: "＋", onClick: openSellModal, isCenter: true },
        { label: "Listings", icon: "≡", href: "/dashboard" },
        { label: "Profile", icon: "👤", href: "/profile" },
    ];

    return (
        <nav style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "calc(64px + env(safe-area-inset-bottom))",
            background: "var(--surface)",
            borderTop: "1px solid var(--border-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            padding: `0 8px env(safe-area-inset-bottom)`,
            zIndex: 300,
            boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
        }}>
            {navItems.map((item, i) => {
                if (item.isCenter) {
                    return (
                        <button
                            key={i}
                            onClick={item.onClick}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                background: "var(--primary)",
                                color: "white",
                                border: "none",
                                fontSize: 24,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: 20,
                                boxShadow: "var(--shadow-md)",
                                cursor: "pointer",
                            }}
                        >
                            {item.icon}
                        </button>
                    );
                }

                const isActive = item.href === "/"
                    ? pathname === "/"
                    : item.href === pathname;

                return (
                    <Link
                        key={i}
                        href={item.href!}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            textDecoration: "none",
                            color: isActive ? "var(--ink)" : "var(--ink-4)",
                            flex: 1,
                            minWidth: 0,
                            padding: "8px 0",
                        }}
                    >
                        <span style={{ fontSize: 20 }}>{item.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
