"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSell } from "@/components/listing/SellProvider";
import { useAuth } from "@/lib/auth/AuthProvider";

interface NavItemProps {
    href: string;
    icon: string;
    label: string;
}

function NavItem({ href, icon, label }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
        <Link href={href} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
            borderRadius: "var(--r)", textDecoration: "none",
            background: isActive ? "var(--bg-2)" : "transparent",
            color: "var(--ink)", fontWeight: isActive ? 600 : 400, fontSize: 14,
        }}>
            <span>{icon}</span>
            {label}
        </Link>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ fontSize: 10, textTransform: "uppercase", color: "var(--ink-4)", letterSpacing: "0.12em", marginBottom: 6, paddingLeft: 8, fontWeight: 600, marginTop: 4 }}>
            {children}
        </div>
    );
}

export default function Sidebar() {
    const router = useRouter();
    const { openSellModal } = useSell();
    const { user } = useAuth();

    const handleListItem = () => {
        if (!user) {
            router.push("/login?returnTo=/");
            return;
        }
        openSellModal();
    };

    const isAdmin      = user?.role === "admin" || user?.role === "superadmin";
    const isSuperadmin = user?.role === "superadmin";

    return (
        <aside style={{
            width: 240, height: "100%", background: "var(--surface)",
            borderRight: "1px solid var(--border-2)",
            position: "sticky", top: 60, overflowY: "auto",
            padding: "24px 16px", display: "flex", flexDirection: "column",
        }}>
            <button
                onClick={handleListItem}
                style={{
                    width: "100%", background: "var(--amber)", color: "white",
                    border: "none", padding: "12px", borderRadius: "var(--r)",
                    fontWeight: 600, fontSize: 14, marginBottom: 20, cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                }}
            >
                List Item
            </button>

            <SectionLabel>BROWSE</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 24 }}>
                {[
                    { href: "/",                         icon: "🏠", label: "All Listings"    },
                    { href: "/?category=books-notes",    icon: "📚", label: "Books & Notes"   },
                    { href: "/?category=electronics",    icon: "💻", label: "Electronics"     },
                    { href: "/?category=furniture",      icon: "🪑", label: "Furniture"       },
                    { href: "/?category=clothing",       icon: "👕", label: "Clothing"        },
                    { href: "/?category=sports-fitness", icon: "⚽", label: "Sports & Fitness"},
                    { href: "/?category=miscellaneous",  icon: "📦", label: "Miscellaneous"   },
                ].map(item => {
                    const pathname = typeof window !== "undefined" ? window.location.search : "";
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
                            borderRadius: "var(--r)", textDecoration: "none",
                            color: "var(--ink)", fontSize: 14,
                        }}>
                            <span>{item.icon}</span>{item.label}
                        </Link>
                    );
                })}
            </div>

            <div style={{ height: 1, background: "var(--border-2)", marginBottom: 16, marginLeft: 8, marginRight: 8 }} />

            <SectionLabel>MY ACCOUNT</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                <NavItem href="/dashboard" icon="≡"  label="My Listings" />
                <NavItem href="/saved"     icon="🔖" label="Saved"       />
                <NavItem href="/profile"   icon="👤" label="Profile"     />
            </div>

            {isAdmin && (
                <>
                    <div style={{ height: 1, background: "var(--border-2)", margin: "12px 8px" }} />
                    <SectionLabel>ADMIN</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <NavItem href="/admin"          icon="📋" label="Pending Queue" />
                        <NavItem href="/admin/listings" icon="📦" label="All Listings"  />
                        <NavItem href="/admin/reports"  icon="⚑"  label="Reports"       />
                        <NavItem href="/admin/users"    icon="👥" label="Users"         />
                    </div>
                </>
            )}

            {isSuperadmin && (
                <>
                    <div style={{ height: 1, background: "var(--border-2)", margin: "12px 8px" }} />
                    <SectionLabel>SUPERADMIN</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <NavItem href="/super-admin/config"   icon="⚙"  label="System Config" />
                        <NavItem href="/super-admin/activity" icon="📜"  label="Activity Log"  />
                        <NavItem href="/super-admin/users"    icon="👤"  label="Manage Roles"  />
                    </div>
                </>
            )}
        </aside>
    );
}
