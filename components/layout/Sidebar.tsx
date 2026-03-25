"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSell } from "@/components/listing/SellProvider";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface NavItemProps {
    href: string;
    icon: string;
    label: string;
    isCollapsed?: boolean;
    searchParams: URLSearchParams;
}

function NavItem({ href, icon, label, isCollapsed, searchParams }: NavItemProps) {
    const pathname = usePathname();

    const category = searchParams.get("category");
    const hrefUrl = new URL(href, "http://localhost"); // base doesn't matter for path/query comparison
    const hrefPath = hrefUrl.pathname;
    const hrefCategory = hrefUrl.searchParams.get("category");

    const isHome = pathname === "/" && hrefPath === "/";
    const isOtherPage = hrefPath !== "/" && (pathname === hrefPath || pathname.startsWith(hrefPath));

    let isActive = false;

    if (isHome) {
        // If it's a home page link, check category
        if (hrefCategory) {
            isActive = category === hrefCategory;
        } else {
            // "All Items" is active if no category is selected
            isActive = !category;
        }
    } else {
        isActive = isOtherPage;
    }
    return (
        <Link href={href}
            title={isCollapsed ? label : ""}
            style={{
                display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                borderRadius: "var(--r)", textDecoration: "none",
                background: isActive ? "var(--bg-2)" : "transparent",
                color: "var(--ink)", fontWeight: isActive ? 600 : 400, fontSize: 14,
                justifyContent: isCollapsed ? "center" : "flex-start",
            }}
        >
            <span style={{ fontSize: 18 }}>{icon}</span>
            {!isCollapsed && label}
        </Link>
    );
}

function SectionLabel({ children, isCollapsed }: { children: React.ReactNode, isCollapsed?: boolean }) {
    if (isCollapsed) return <div style={{ height: 1, background: "var(--border-2)", margin: "12px 8px" }} />;
    return (
        <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--ink-4)", letterSpacing: "0.12em", marginBottom: 6, paddingLeft: 8, fontWeight: 600, marginTop: 4 }}>
            {children}
        </div>
    );
}

export default function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
    const router = useRouter();
    const { openSellModal } = useSell();
    const { user } = useAuth();
    const breakpoint = useBreakpoint();

    // On tablet, sidebar is icon-only strip (64px)
    const isCollapsed = !isMobile && breakpoint === "tablet";

    // On mobile screens, the Sidebar component is only rendered inside the MobileDrawer
    // The Layout handles the conditional rendering of Sidebar on Desktop/Tablet

    const handleListItem = () => {
        if (!user) {
            router.push("/login?returnTo=/");
            return;
        }
        openSellModal();
    };

    const isAdmin = user?.role === "admin" || user?.role === "superadmin";
    const isSuperadmin = user?.role === "superadmin";

    const searchParams = useSearchParams();

    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    useEffect(() => {
        fetch("/api/categories")
            .then(r => r.json())
            .then(data => {
                const cats = Array.isArray(data) ? data : (data.categories || []);
                setCategories(cats);
                setLoadingCats(false);
            })
            .catch(err => {
                console.error("Failed to fetch categories:", err);
                setLoadingCats(false);
            });
    }, []);

    return (
        <aside style={{
            width: isCollapsed ? 64 : (isMobile ? "100%" : 240),
            height: isMobile ? "auto" : "100%",
            background: isMobile ? "transparent" : "var(--surface)",
            borderRight: isMobile ? "none" : "1px solid var(--border-2)",
            position: isMobile ? "relative" : "sticky",
            top: isMobile ? 0 : 60,
            overflowY: "auto",
            padding: isCollapsed ? "16px 8px" : "24px 16px",
            display: "flex", flexDirection: "column",
        }}>
            {!isMobile && !isCollapsed && (
                <button
                    onClick={handleListItem}
                    style={{
                        width: "100%", background: "var(--primary)", color: "white",
                        border: "none", padding: "12px", borderRadius: "var(--r)",
                        fontWeight: 600, fontSize: 14, marginBottom: 20, cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                    }}
                >
                    List Item
                </button>
            )}

            {isCollapsed && (
                <button
                    onClick={handleListItem}
                    title="List Item"
                    style={{
                        width: 44, height: 44, background: "var(--primary)", color: "white",
                        border: "none", borderRadius: "var(--r)",
                        fontSize: 20, marginBottom: 20, cursor: "pointer",
                        display: "grid", placeItems: "center"
                    }}
                >
                    ＋
                </button>
            )}

            <SectionLabel isCollapsed={isCollapsed}>BROWSE</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 24 }}>
                <NavItem
                    href="/"
                    icon="🏠"
                    label="All Items"
                    isCollapsed={isCollapsed}
                    searchParams={searchParams}
                />
                {!loadingCats && categories.map(cat => (
                    <NavItem
                        key={cat.slug}
                        href={`/?category=${cat.slug}`}
                        icon={cat.icon || "📦"}
                        label={cat.name}
                        isCollapsed={isCollapsed}
                        searchParams={searchParams}
                    />
                ))}
            </div>

            <SectionLabel isCollapsed={isCollapsed}>MY ACCOUNT</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <NavItem href="/dashboard" icon="≡" label="My Listings" isCollapsed={isCollapsed} searchParams={searchParams} />
                <NavItem href="/saved" icon="🔖" label="Saved" isCollapsed={isCollapsed} searchParams={searchParams} />
                <NavItem href="/profile" icon="👤" label="Profile" isCollapsed={isCollapsed} searchParams={searchParams} />
            </div>

            {/* Admin Panel button stays at the bottom */}
            {isAdmin && (
                <Link href="/admin"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: "12px",
                        background: 'var(--bg-2)', borderRadius: 'var(--r)',
                        color: 'var(--ink)', textDecoration: 'none', marginTop: 'auto',
                        fontWeight: 600, fontSize: 13
                    }}
                >
                    <span style={{ fontSize: 18 }}>🛡️</span>
                    {!isCollapsed && (isSuperadmin ? "Super Admin Panel →" : "Admin Panel →")}
                </Link>
            )}
        </aside>
    );
}
