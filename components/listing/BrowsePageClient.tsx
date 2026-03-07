"use client";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import Link from "next/link";
import SortSelect from "./SortSelect";
import { Suspense } from "react";
import SkeletonCard from "./SkeletonCard";

export default function BrowsePageClient({
    params,
    userUid,
    children
}: {
    params: any;
    userUid?: string;
    children: React.ReactNode;
}) {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const isTablet = breakpoint === "tablet";

    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
            {/* Filter Row */}
            <div style={{
                position: "sticky", top: 0, zIndex: 10, background: "var(--bg)",
                padding: isMobile ? "12px 16px" : "16px 20px", display: "flex", justifyContent: "space-between",
                alignItems: "center", borderBottom: "1px solid var(--border-2)",
                gap: 12
            }}>
                <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: isMobile ? 0 : 4, flex: 1 }}>
                    {["all", "new", "like-new", "good", "used", "damaged"].map(c => {
                        const active = (params.condition || "all") === c;
                        return (
                            <Link
                                key={c}
                                href={{ query: { ...params, condition: c === "all" ? undefined : c } }}
                                style={{
                                    padding: "6px 14px", borderRadius: 100, fontSize: 12,
                                    textTransform: "capitalize", textDecoration: "none",
                                    background: active ? "var(--ink)" : "var(--surface)",
                                    color: active ? "white" : "var(--ink-2)",
                                    border: `1.5px solid ${active ? "var(--ink)" : "var(--border-2)"}`,
                                    fontWeight: active ? 600 : 500,
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {c.replace("-", " ")}
                            </Link>
                        )
                    })}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Suspense fallback={null}>
                        <SortSelect />
                    </Suspense>
                </div>
            </div>

            <div style={{ padding: "20px 20px 8px", color: "var(--ink-4)", fontSize: 12, fontWeight: 500 }}>
                {/* Result count would be here */}
            </div>

            <Suspense fallback={
                <div style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                    gap: isMobile ? 10 : isTablet ? 12 : 16,
                    padding: isMobile ? 12 : isTablet ? 16 : 24
                }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <SkeletonCard key={i} />)}
                </div>
            }>
                {children}
            </Suspense>
        </div>
    );
}
