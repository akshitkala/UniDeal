"use client";

import { useState, useEffect } from "react";
import PhotoUploadZone from "./PhotoUploadZone";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";

import { validateForm, FIELD_RULES } from "@/lib/validation/client-validate";
import FieldError from "@/components/ui/FieldError";

interface SellModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: {
        _id: string;
        slug: string;
        title: string;
        description: string;
        price: number;
        condition: string;
        category: string;
        images: string[];
        whatsapp?: string;
    };
    mode?: 'create' | 'edit';
    onSuccess?: (data: any) => void;
}

export default function SellModal({ isOpen, onClose, initialData, mode = 'create', onSuccess }: SellModalProps) {
    const isEdit = mode === 'edit';
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const [step, setStep] = useState(isEdit ? 2 : 1);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        price: initialData?.price?.toString() || "",
        negotiable: false,
        category: initialData?.category || "",
        condition: initialData?.condition || "good",
        images: initialData?.images || [] as string[],
        location: "LPU Campus"
    });
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [whatsapp, setWhatsapp] = useState('');
    const [whatsappSaved, setWhatsappSaved] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // Fetch categories
        fetch('/api/categories')
            .then(r => r.json())
            .then(data => {
                const cats = Array.isArray(data) ? data : data.categories ?? [];
                setCategories(cats);
            })
            .catch(() => { });

        // Fetch profile for whatsapp pre-fill (only on create mode)
        if (!isEdit) {
            fetch('/api/users/profile')
                .then(r => r.json())
                .then(data => {
                    const prof = data.user || data;
                    if (prof?.whatsapp) {
                        const digits = prof.whatsapp.replace('+91', '').replace(/\D/g, '');
                        if (digits.length === 10) {
                            setWhatsapp(digits);
                            setWhatsappSaved(true);
                        }
                    }
                })
                .catch(() => { });
        }
    }, [isOpen, isEdit]);

    useEffect(() => {
        if (isOpen && initialData) {
            const data = initialData as any;
            setFormData({
                title: data.title || "",
                description: data.description || "",
                price: data.price?.toString() || "",
                category: data.category?._id || data.category || "",
                condition: data.condition || "",
                location: data.location || "",
                images: data.images || [],
            });
            const phoneVal = data.sellerWhatsapp || data.whatsapp;
            if (phoneVal) {
                setWhatsapp(phoneVal.replace('+91', ''));
                setWhatsappSaved(true);
            }
            setStep(2);
        }
    }, [isOpen, initialData]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateForm({
            title: { value: formData.title, rules: FIELD_RULES.title },
            description: { value: formData.description, rules: FIELD_RULES.description },
            price: { value: formData.price, rules: FIELD_RULES.price },
            whatsapp: { value: whatsapp, rules: FIELD_RULES.whatsapp },
        });

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setSubmitting(true);
        setFieldErrors({});

        const fullNumber = `+91${whatsapp.replace(/\D/g, '')}`;

        const method = isEdit ? 'PATCH' : 'POST';
        const url = isEdit ? `/api/listings/${initialData?.slug}` : '/api/listings';

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    whatsapp: fullNumber
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to post listing");

            // Also save to profile silently
            fetch('/api/users/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsapp: fullNumber }),
            }).catch(() => { }); // silent — never block the listing flow

            onClose();
            if (onSuccess) {
                onSuccess(data.listing || data);
            } else if (isEdit) {
                // Fallback if no onSuccess provided for edit
                router.refresh();
            } else {
                router.push(`/listings/${data.slug}`);
            }
        } catch (err: any) {
            setFieldErrors({ general: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackOrClose = () => {
        if (step > 1 && !isEdit) {
            setStep(step - 1);
        } else {
            onClose();
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
                <div style={{
                    padding: isMobile ? "16px 20px" : "20px 24px",
                    borderBottom: "1px solid var(--border-2)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    {isMobile ? (
                        <>
                            <button
                                onClick={handleBackOrClose}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px 4px 0',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    color: 'var(--ink-3)', fontSize: 14, fontFamily: 'var(--font-sans)',
                                }}
                            >
                                ← Back
                            </button>
                            <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-serif)", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                                {isEdit ? "Edit Listing" : step === 1 ? "Select Category" : "Item Details"}
                            </h2>
                            <div style={{ width: 60 }} /> {/* spacer */}
                        </>
                    ) : (
                        <>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                {step > 1 && !isEdit && (
                                    <button
                                        onClick={handleBackOrClose}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}
                                    >← Back</button>
                                )}
                                <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-serif)" }}>
                                    {isEdit ? "Edit Listing" : step === 1 ? "Select Category" : "Item Details"}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    width: 32, height: 32, borderRadius: '50%',
                                    display: 'grid', placeItems: 'center',
                                    color: 'var(--ink-4)', fontSize: 18,
                                }}
                            >✕</button>
                        </>
                    )}
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
                                    onChange={(e) => {
                                        setFormData({ ...formData, title: e.target.value });
                                        if (fieldErrors.title) setFieldErrors(f => ({ ...f, title: '' }));
                                    }}
                                    style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14 }}
                                />
                                <FieldError error={fieldErrors.title} />
                            </div>

                            <div style={{ display: "flex", gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>PRICE (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="500"
                                        value={formData.price}
                                        onChange={(e) => {
                                            setFormData({ ...formData, price: e.target.value });
                                            if (fieldErrors.price) setFieldErrors(f => ({ ...f, price: '' }));
                                        }}
                                        style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14 }}
                                    />
                                    <FieldError error={fieldErrors.price} />
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
                                            if (fieldErrors.whatsapp) setFieldErrors(f => ({ ...f, whatsapp: '' }));
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
                                <FieldError error={fieldErrors.whatsapp} />

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
                                    onChange={(e) => {
                                        setFormData({ ...formData, description: e.target.value });
                                        if (fieldErrors.description) setFieldErrors(f => ({ ...f, description: '' }));
                                    }}
                                    style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14, resize: "none" }}
                                />
                                <FieldError error={fieldErrors.description} />
                            </div>

                            {fieldErrors.general && <div style={{ color: "var(--red)", fontSize: 12 }}>⚠️ {fieldErrors.general}</div>}
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
                                background: (submitting || formData.images.length === 0) ? "var(--ink-5)" : "var(--primary)",
                                color: "white", fontWeight: 600, cursor: (submitting || formData.images.length === 0) ? "not-allowed" : "pointer"
                            }}
                        >
                            {submitting ? (isEdit ? "Saving..." : "Posting...") : (isEdit ? "Save Changes" : "Post Now")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
