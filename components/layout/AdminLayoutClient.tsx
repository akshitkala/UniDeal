"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Topbar from "@/components/layout/Topbar";
import BottomNav from "@/components/layout/BottomNav";
import MobileDrawer from "@/components/layout/MobileDrawer";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const isTablet = breakpoint === "tablet";

    return (
        <div style={{ display: "flex", height: "100dvh", overflow: "hidden", flexDirection: "column" }}>
            <Topbar onOpenMenu={() => setIsMenuOpen(true)} />

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {!isMobile && <AdminSidebar />}

                <main style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    position: "relative",
                    background: "var(--bg)",
                    paddingBottom: isMobile ? "calc(64px + env(safe-area-inset-bottom))" : 0
                }}>
                    <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                        {children}
                    </div>
                </main>
            </div>

            {isMobile && <BottomNav />}
            <MobileDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </div>
    );
}
