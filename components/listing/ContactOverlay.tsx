"use client";

import { useState, useEffect } from "react";

interface Props {
    slug: string;
    onClose: () => void;
}

export default function ContactOverlay({ slug, onClose }: Props) {
    const [waLink, setWaLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContact = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/listings/${slug}/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const result = await res.json();

            if (!res.ok) throw new Error(result.error || "Failed to fetch contact");

            setWaLink(result.waLink);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContact();
    }, [slug]);

    const handleOpenWhatsApp = () => {
        if (waLink) {
            window.open(waLink, "_blank");
            onClose();
        }
    };

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
                <div style={{ fontSize: 40, marginBottom: 16 }}>📱</div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Contact Seller</h2>
                <p style={{ fontSize: 14, color: "var(--ink-3)", marginBottom: 24 }}>
                    Buyers will contact you directly via WhatsApp for faster communication.
                </p>

                {loading ? (
                    <div style={{ padding: "20px 0", color: "var(--ink-4)", fontSize: 14 }}>
                        Generating secure link...
                    </div>
                ) : error ? (
                    <div style={{ padding: "20px 0", color: "var(--red)", fontSize: 13 }}>
                        ⚠️ {error}
                    </div>
                ) : (
                    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                        <button
                            onClick={handleOpenWhatsApp}
                            style={{
                                width: "100%", padding: "16px", borderRadius: "var(--r)",
                                background: "#25D366", color: "white", fontWeight: 700, border: "none",
                                cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center",
                                justifyContent: "center", gap: 10
                            }}
                        >
                            Open WhatsApp
                        </button>

                        <div style={{
                            marginTop: 12, padding: 12, background: "var(--red-bg)", color: "var(--red)",
                            fontSize: 11, borderRadius: "var(--r)", textAlign: "left", lineHeight: 1.5
                        }}>
                            <b>SAFETY TIP:</b> Meet in public campus areas only. Inspect the item thoroughly before paying. Never share personal OTPs or payment links.
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    style={{
                        marginTop: 24, width: "100%", padding: "12px", borderRadius: "var(--r)",
                        background: "none", color: "var(--ink-4)", fontWeight: 600, border: "none", cursor: "pointer",
                        fontSize: 14
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
