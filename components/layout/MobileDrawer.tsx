"use client";

import { useEffect, useState, Suspense } from "react";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";
import { usePathname } from "next/navigation";
import Link from 'next/link';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isAdmin?: boolean;
}

export default function MobileDrawer({ isOpen, onClose, isAdmin = false }: Props) {
    const pathname = usePathname();

    useEffect(() => {
        if (isOpen) {
            onClose();
        }
    }, [pathname]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    zIndex: 1000,
                    display: isOpen ? "block" : "none",
                    animation: "fadeIn 0.2s ease-out",
                }}
            />

            {/* Drawer */}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 280,
                    background: "var(--surface)",
                    zIndex: 1001,
                    boxShadow: "var(--shadow-lg)",
                    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.3s var(--ease)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
                        <div style={{ width: 32, height: 32, background: "var(--ink)", borderRadius: 8, display: "grid", placeItems: "center", color: "white", fontSize: 16 }}>🏷</div>
                        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 18 }}>UniDeal</span>
                    </Link>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--ink-4)" }}>×</button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", paddingBottom: "env(safe-area-inset-bottom)" }}>
                    <Suspense fallback={null}>
                        {isAdmin ? <AdminSidebar isMobile /> : <Sidebar isMobile />}
                    </Suspense>
                </div>
            </div>

            <style jsx global>{`
                ${isOpen ? "body { overflow: hidden; }" : ""}
            `}</style>
        </>
    );
}
