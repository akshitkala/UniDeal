"use client";

import { useState, useEffect } from "react";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface SystemConfig {
    approvalMode: 'manual' | 'automatic' | 'ai-gated';
    maintenanceMode: boolean;
    allowNewListings: boolean;
}

export default function SuperAdminConfigPage() {
    const [config, setConfig] = useState<SystemConfig>({
        approvalMode: 'manual',
        maintenanceMode: false,
        allowNewListings: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    useEffect(() => {
        fetch("/api/super-admin/config")
            .then(res => res.json())
            .then(data => {
                setConfig(data.config || {
                    approvalMode: "automatic",
                    maintenanceMode: false,
                    allowNewListings: true
                });
                setLoading(false);
            });
    }, []);

    const updateConfig = async (updates: any) => {
        const prevConfig = { ...config };

        // Optimistic update
        setConfig(prev => ({ ...prev, ...updates }));

        try {
            const res = await fetch("/api/super-admin/config", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (res.ok) {
                setConfig(data.config);
            } else {
                alert(data.error || "Update failed");
                setConfig(prevConfig); // revert
            }
        } catch (err) {
            alert("Error updating config");
            setConfig(prevConfig); // revert
        }
    };

    if (loading) return <div style={{ padding: 40, color: "var(--ink-4)" }}>Loading configurations...</div>;

    return (
        <div style={{
            padding: isMobile ? "24px 16px 80px" : "40px",
            maxWidth: 800,
            minHeight: "100dvh"
        }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: isMobile ? 28 : 32, fontWeight: 700, marginBottom: 8 }}>System Configuration</h1>
            <p style={{ color: "var(--ink-4)", marginBottom: 32, fontSize: 13 }}>Global controls for UniDeal platform status and behavior.</p>

            <div style={{ display: "grid", gap: 20 }}>
                {/* Maintenance Mode */}
                <div style={{
                    padding: isMobile ? 20 : 24, borderRadius: "var(--r-md)",
                    background: config.maintenanceMode ? "#FEF2F2" : "white",
                    border: `1.5px solid ${config.maintenanceMode ? "var(--red)" : "var(--border-2)"}`,
                    display: "flex", flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
                    gap: 20
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Maintenance Mode</h3>
                        <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                            When active, the public site shows a maintenance screen. Admins still have access.
                        </p>
                        {config.maintenanceMode && (
                            <p style={{ fontSize: 12, color: "var(--red)", fontWeight: 700, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                                ⚠️ Site is currently inaccessible to students.
                            </p>
                        )}
                    </div>
                    <button
                        disabled={saving}
                        onClick={() => updateConfig({ maintenanceMode: !config.maintenanceMode })}
                        style={{
                            width: isMobile ? "100%" : "auto",
                            padding: "12px 24px", borderRadius: "var(--r)", fontWeight: 700, cursor: "pointer",
                            background: config.maintenanceMode ? "var(--red)" : "var(--ink)",
                            color: "white",
                            border: "none", transition: "all 0.2s var(--ease)",
                            fontSize: 14
                        }}
                    >
                        {config.maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
                    </button>
                </div>

                {/* Approval Mode */}
                <div style={{
                    padding: isMobile ? 20 : 24, borderRadius: "var(--r-md)", background: "white",
                    border: "1.5px solid var(--border-2)",
                    display: "flex", flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
                    gap: 16
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Listing Approval Strategy</h3>
                        <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                            Control how new listings are published to the site.
                        </p>
                    </div>
                    <select
                        disabled={saving}
                        value={config.approvalMode}
                        onChange={(e) => updateConfig({ approvalMode: e.target.value })}
                        style={{
                            width: isMobile ? "100%" : "auto",
                            padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", fontWeight: 600, cursor: "pointer",
                            background: "var(--surface)", fontFamily: "var(--font-sans)", fontSize: 14
                        }}
                    >
                        <option value="automatic">Automatic (Instant)</option>
                        <option value="manual">Manual (Admin Queue)</option>
                        <option value="ai-gated">AI Gated (Moderation Trigger)</option>
                    </select>
                </div>

                {/* Allow New Listings */}
                <div style={{
                    padding: isMobile ? 20 : 24, borderRadius: "var(--r-md)", background: "white",
                    border: "1.5px solid var(--border-2)",
                    display: "flex", flexDirection: isMobile ? "column" : "row",
                    justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
                    gap: 16
                }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Accept New Listings</h3>
                        <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.5 }}>
                            If disabled, "Sell" features will return a 503 error.
                        </p>
                    </div>
                    <button
                        disabled={saving}
                        onClick={() => updateConfig({ allowNewListings: !config.allowNewListings })}
                        style={{
                            width: isMobile ? "100%" : "auto",
                            padding: "12px 24px", borderRadius: "var(--r)", fontWeight: 700, cursor: "pointer",
                            background: config.allowNewListings ? "var(--green)" : "var(--ink-4)",
                            color: "white", border: "none", fontSize: 14
                        }}
                    >
                        {config.allowNewListings ? "Accepting Posts" : "Posts Paused"}
                    </button>
                </div>
            </div>
        </div>
    );
}
