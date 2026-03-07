"use client";

import { useState, useEffect } from "react";
import PhotoUploadZone from "./PhotoUploadZone";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function SellModal({ isOpen, onClose }: Props) {
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        negotiable: false,
        category: "",
        condition: "good",
        images: [] as string[],
        location: "LPU Campus"
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [whatsapp, setWhatsapp] = useState('');
    const [whatsappSaved, setWhatsappSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetch("/api/categories")
                .then((res) => res.json())
                .then((data) => setCategories(data.categories || []));

            // Fetch profile for WhatsApp number
            fetch('/api/users/profile')
                .then(r => r.json())
                .then(data => {
                    if (data.whatsappNumber) {
                        setWhatsapp(data.whatsappNumber.replace('+91', ''));
                        setWhatsappSaved(true);
                    }
                })
                .catch(() => { });
        } else {
            // Reset on close
            setStep(1);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!whatsapp || whatsapp.replace(/\D/g, '').length < 10) {
            setError('Please enter a valid 10-digit WhatsApp number');
            return;
        }

        setSubmitting(true);
        setError(null);

        const fullNumber = `+91${whatsapp.replace(/\D/g, '')}`;

        try {
            const res = await fetch("/api/listings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    whatsappNumber: fullNumber
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to post listing");

            // Also save to profile silently
            fetch('/api/users/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsappNumber: fullNumber }),
            }).catch(() => { }); // silent — never block the listing flow

            onClose();
            router.push(`/listings/${data.slug}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)", zIndex: 2000,
            display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center",
            padding: isMobile ? 0 : 20
        }}>
            <div style={{
                width: "100%", maxWidth: isMobile ? "none" : 500,
                height: isMobile ? "100dvh" : "auto",
                background: "var(--surface)",
                borderRadius: isMobile ? 0 : "var(--r-lg)",
                overflow: "hidden", display: "flex", flexDirection: "column",
                maxHeight: isMobile ? "none" : "90dvh",
                boxShadow: "var(--shadow-lg)",
                animation: isMobile ? "slideInUp 0.3s var(--ease)" : "fadeUp 0.3s var(--ease)"
            }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-serif)" }}>
                        {step === 1 ? "Select Category" : "Item Details"}
                    </h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--ink-4)" }}>×</button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                    {step === 1 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => {
                                        setFormData({ ...formData, category: cat._id });
                                        setStep(2);
                                    }}
                                    style={{
                                        padding: 16, borderRadius: "var(--r)", border: "1.5px solid var(--border-2)",
                                        background: "var(--surface)", cursor: "pointer", transition: "all 0.2s var(--ease)",
                                        textAlign: "center"
                                    }}
                                    className="cat-btn"
                                >
                                    <style dangerouslySetInnerHTML={{
                                        __html: `
                    .cat-btn:hover { border-color: var(--ink); background: var(--bg-2); }
                  `}} />
                                    <div style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{cat.name}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <form id="sell-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>PHOTOS</label>
                                <PhotoUploadZone onUpload={(urls) => setFormData({ ...formData, images: urls })} />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>TITLE</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Engineering Mathematics Book Vol 1"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14 }}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>PRICE (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="500"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14 }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>CONDITION</label>
                                    <select
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                        style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14, background: "var(--surface)" }}
                                    >
                                        <option value="new">Brand New</option>
                                        <option value="like-new">Like New</option>
                                        <option value="good">Good</option>
                                        <option value="used">Used</option>
                                        <option value="damaged">Damaged / For Parts</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>
                                    WhatsApp Number <span style={{ color: 'var(--red)' }}>*</span>
                                </label>

                                {whatsappSaved && (
                                    <div style={{
                                        fontSize: 12, color: 'var(--green)',
                                        marginBottom: 6,
                                        display: 'flex', alignItems: 'center', gap: 4,
                                    }}>
                                        ✓ Using your saved number — buyers will contact you here
                                    </div>
                                )}

                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute', left: 12, top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: 13, color: 'var(--ink-4)',
                                        fontWeight: 600,
                                    }}>+91</span>
                                    <input
                                        type="tel"
                                        value={whatsapp}
                                        onChange={e => {
                                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setWhatsapp(digits);
                                            setWhatsappSaved(false);
                                        }}
                                        placeholder="9876543210"
                                        maxLength={10}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px 10px 44px',
                                            border: '1.5px solid var(--border-2)',
                                            borderRadius: 'var(--r)',
                                            fontSize: 14,
                                            fontFamily: 'var(--font-sans)',
                                            outline: 'none',
                                        }}
                                    />
                                </div>

                                <p style={{ fontSize: 11, color: 'var(--ink-5)', marginTop: 4 }}>
                                    📱 Buyers will contact you on WhatsApp. Never shown publicly.
                                </p>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    id="negotiable"
                                    checked={formData.negotiable}
                                    onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })}
                                />
                                <label htmlFor="negotiable" style={{ fontSize: 13, cursor: "pointer" }}>Price is negotiable</label>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>DESCRIPTION</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Tell us more about the item..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14, resize: "none" }}
                                />
                            </div>

                            {error && <div style={{ color: "var(--red)", fontSize: 12 }}>⚠️ {error}</div>}
                        </form>
                    )}
                </div>

                {step === 2 && (
                    <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border-2)", display: "flex", gap: 12 }}>
                        <button
                            onClick={() => setStep(1)}
                            style={{ flex: 1, padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", background: "var(--surface)", fontWeight: 600, cursor: "pointer" }}
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            form="sell-form"
                            disabled={submitting || formData.images.length === 0}
                            style={{
                                flex: 2, padding: "12px", borderRadius: "var(--r)", border: "none",
                                background: (submitting || formData.images.length === 0) ? "var(--ink-5)" : "var(--amber)",
                                color: "white", fontWeight: 600, cursor: (submitting || formData.images.length === 0) ? "not-allowed" : "pointer"
                            }}
                        >
                            {submitting ? "Posting..." : "Post Now"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
