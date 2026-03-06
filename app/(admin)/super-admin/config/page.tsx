"use client";

import { useState, useEffect } from "react";

export default function SuperAdminConfigPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
        setSaving(true);
        try {
            const res = await fetch("/api/super-admin/config", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (res.ok) setConfig(data.config);
            else alert(data.error || "Update failed");
        } catch (err) {
            alert("Error updating config");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 40 }}>Loading configurations...</div>;

    return (
        <div style={{ padding: 40, maxWidth: 800 }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, marginBottom: 8 }}>System Configuration</h1>
            <p style={{ color: "var(--ink-4)", marginBottom: 32 }}>Global controls for UniDeal platform status and behavior.</p>

            <div style={{ display: "grid", gap: 24 }}>
                {/* Maintenance Mode */}
                <div style={{
                    padding: 24, borderRadius: "var(--r-md)", background: config.maintenanceMode ? "#FEF2F2" : "white",
                    border: `1.5px solid ${config.maintenanceMode ? "var(--red)" : "var(--border-2)"}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Maintenance Mode</h3>
                        <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
                            When active, the public site shows a maintenance screen. Admins still have access.
                        </p>
                        {config.maintenanceMode && (
                            <p style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, marginTop: 8 }}>
                                ⚠️ WARNING: Site is currently inaccessible to students.
                            </p>
                        )}
                    </div>
                    <button
                        disabled={saving}
                        onClick={() => updateConfig({ maintenanceMode: !config.maintenanceMode })}
                        style={{
                            padding: "10px 20px", borderRadius: "var(--r)", fontWeight: 700, cursor: "pointer",
                            background: config.maintenanceMode ? "var(--red)" : "var(--bg-3)",
                            color: config.maintenanceMode ? "white" : "var(--ink-2)",
                            border: "none", transition: "all 0.2s var(--ease)"
                        }}
                    >
                        {config.maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
                    </button>
                </div>

                {/* Approval Mode */}
                <div style={{
                    padding: 24, borderRadius: "var(--r-md)", background: "white",
                    border: "1.5px solid var(--border-2)",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Listing Approval Strategy</h3>
                        <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
                            Control how new listings are published to the site.
                        </p>
                    </div>
                    <select
                        disabled={saving}
                        value={config.approvalMode}
                        onChange={(e) => updateConfig({ approvalMode: e.target.value })}
                        style={{ padding: "10px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", fontWeight: 600, cursor: "pointer" }}
                    >
                        <option value="automatic">Automatic (Instant)</option>
                        <option value="manual">Manual (Admin Queue)</option>
                        <option value="ai-gated">AI Gated (Moderation Trigger)</option>
                    </select>
                </div>

                {/* Allow New Listings */}
                <div style={{
                    padding: 24, borderRadius: "var(--r-md)", background: "white",
                    border: "1.5px solid var(--border-2)",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Accept New Listings</h3>
                        <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
                            If disabled, "Sell" features will return a 503 error.
                        </p>
                    </div>
                    <button
                        disabled={saving}
                        onClick={() => updateConfig({ allowNewListings: !config.allowNewListings })}
                        style={{
                            padding: "10px 20px", borderRadius: "var(--r)", fontWeight: 700, cursor: "pointer",
                            background: config.allowNewListings ? "var(--green)" : "var(--ink-4)",
                            color: "white", border: "none"
                        }}
                    >
                        {config.allowNewListings ? "Accepting Posts" : "Posts Paused"}
                    </button>
                </div>
            </div>
        </div>
    );
}
