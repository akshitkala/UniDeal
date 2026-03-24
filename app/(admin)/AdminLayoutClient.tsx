"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    return (
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
            {isMobile && <AdminTopbar onOpenMenu={() => setIsMenuOpen(true)} />}
            
            <div style={{ display: "flex", flex: 1 }}>
                {!isMobile && <AdminSidebar />}
                
                <main style={{ 
                    flex: 1, 
                    overflowY: "auto", 
                    background: "#fafaf9",
                    minHeight: isMobile ? "calc(100vh - 60px)" : "100vh"
                }}>
                    {children}
                </main>
            </div>

            {isMobile && (
                <MobileDrawer 
                    isOpen={isMenuOpen} 
                    onClose={() => setIsMenuOpen(false)} 
                    isAdmin 
                />
            )}
        </div>
    );
}
