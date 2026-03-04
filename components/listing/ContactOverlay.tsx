"use client";

import { useState } from "react";

interface Props {
    slug: string;
    onClose: () => void;
}

export default function ContactOverlay({ slug, onClose }: Props) {
    const [data, setData] = useState<{ phone?: string; email?: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContact = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/listings/${slug}/contact`);
            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Failed to fetch contact");

            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount
    useState(() => {
        fetchContact();
    });

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
            zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
            <div style={{
                width: "100%", maxWidth: 400, background: "var(--surface)",
                borderRadius: "var(--r-lg)", padding: 32, boxShadow: "var(--shadow-lg)",
                animation: "fadeUp 0.3s var(--ease)", textAlign: "center"
            }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🤝</div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Contact Seller</h2>

                {loading ? (
                    <div style={{ padding: "20px 0", color: "var(--ink-4)", fontSize: 14 }}>
                        Securing connection...
                    </div>
                ) : error ? (
                    <div style={{ padding: "20px 0", color: "var(--red)", fontSize: 13 }}>
                        ⚠️ {error}
                    </div>
                ) : (
                    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div style={{ background: "var(--bg)", padding: 16, borderRadius: "var(--r)", border: "1.5px solid var(--border-2)" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 4 }}>PHONE</div>
                            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.05em" }}>{data?.phone || "Not provided"}</div>
                        </div>
                        <div style={{ background: "var(--bg)", padding: 16, borderRadius: "var(--r)", border: "1.5px solid var(--border-2)" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-4)", textTransform: "uppercase", marginBottom: 4 }}>EMAIL</div>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>{data?.email || "Not provided"}</div>
                        </div>

                        <div style={{
                            marginTop: 12, padding: 12, background: "var(--red-bg)", color: "var(--red)",
                            fontSize: 11, borderRadius: "var(--r)", textAlign: "left", lineHeight: 1.5
                        }}>
                            <b>SAFTY TIP:</b> Meet in public campus areas only. Inspect the item thoroughly before paying. Never share personal OTPs.
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    style={{
                        marginTop: 24, width: "100%", padding: "12px", borderRadius: "var(--r)",
                        background: "var(--ink)", color: "white", fontWeight: 600, border: "none", cursor: "pointer"
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
