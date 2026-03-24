"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ContactButton } from "./ContactButton";
import { useRouter } from "next/navigation";

interface Props {
    slug: string;
    isModal?: boolean;
}

export default function ListingDetail({ slug, isModal = false }: Props) {
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState(0);

    const { user } = useAuth();
    const router = useRouter();
    const [isReporting, setIsReporting] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportStatus, setReportStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    useEffect(() => {
        async function fetchListing() {
            try {
                const res = await fetch(`/api/listings/${slug}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to load listing");
                setListing(data.listing);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchListing();
    }, [slug]);

    if (loading) return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--ink-4)" }}>
            Loading listing...
        </div>
    );

    if (error || !listing) return (
        <div style={{ padding: 40, textAlign: "center", color: "var(--red)" }}>
            Error: {error || "Listing not found"}
        </div>
    );

    const { title, description, price, negotiable, condition, images, location, createdAt, seller, category } = listing;

    return (
        <div style={{
            display: "flex", flexWrap: "wrap",
            gap: 32, padding: isModal ? "20px" : "40px",
            maxWidth: 1000, margin: "0 auto"
        }}>
            {/* Left: Images */}
            <div style={{ flex: "1 1 500px", minWidth: 300 }}>
                <div style={{
                    position: "relative", aspectRatio: "4/3",
                    borderRadius: "var(--r-lg)", overflow: "hidden",
                    background: "var(--bg-2)", border: "1px solid var(--border-2)",
                    marginBottom: 16
                }}>
                    <Image
                        src={images[activeImage] || "/placeholder-listing.png"}
                        alt={title}
                        fill
                        style={{ objectFit: "contain" }}
                    />
                </div>

                {images.length > 1 && (
                    <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                        {images.map((img: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                style={{
                                    width: 60, height: 60, flexShrink: 0, borderRadius: "var(--r)",
                                    border: activeImage === i ? "2px solid var(--ink)" : "2px solid transparent",
                                    overflow: "hidden", cursor: "pointer", background: "none", padding: 0
                                }}
                            >
                                <Image src={img} alt="" width={60} height={60} style={{ objectFit: "cover" }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: Info */}
            <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: 24 }}>
                <header>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                            padding: "4px 10px", borderRadius: 100, background: "var(--bg-2)", color: "var(--ink-3)"
                        }}>
                            {category?.icon} {category?.name}
                        </span>
                        <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                            padding: "4px 10px", borderRadius: 100, background: "var(--bg-3)", color: "var(--ink-2)"
                        }}>
                            {condition.replace("-", " ")}
                        </span>
                    </div>
                    <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, marginBottom: 12 }}>
                        {title}
                    </h1>
                    <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--ink)" }}>
                        ₹{price.toLocaleString("en-IN")}
                        {negotiable && (
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", marginLeft: 12, verticalAlign: "middle" }}>
                                Negotiable
                            </span>
                        )}
                    </div>
                </header>

                <div style={{ height: 1, background: "var(--border-2)" }} />

                <section>
                    <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "var(--ink-3)" }}>Description</h2>
                    <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {description}
                    </p>
                </section>

                <section style={{
                    background: "var(--bg-2)", padding: 20, borderRadius: "var(--r-md)",
                    display: "flex", flexDirection: "column", gap: 16
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "50%", background: "var(--ink)",
                            color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 18, fontWeight: 700
                        }}>
                            {seller?.displayName?.charAt(0) || "U"}
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                                {seller?.displayName}
                                {seller?.emailVerified && (
                                    <span style={{ fontSize: 14, color: "var(--blue)" }} title="Verified Student">✓</span>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--ink-4)", display: "flex", gap: 8 }}>
                                <span>Seller on UniDeal</span>
                                <span>•</span>
                                <span style={{ color: "var(--blue)", fontWeight: 600 }}>Trust Lvl 1</span>
                            </div>
                        </div>
                    </div>

                    <ContactButton listing={listing} />

                    <div style={{ fontSize: 11, color: "var(--ink-4)", textAlign: "center" }}>
                        Never pay in advance. Meet on campus in a public place.
                    </div>

                    <div style={{ marginTop: 8 }}>
                        {reportStatus === "success" ? (
                            <div style={{ fontSize: 12, color: "var(--green)", textAlign: "center", padding: 8, background: "var(--green-bg)", borderRadius: "var(--r)" }}>
                                Report submitted. Thank you for keeping UniDeal safe!
                            </div>
                        ) : isReporting ? (
                            <div style={{ background: "var(--bg)", padding: 12, borderRadius: "var(--r)", display: "flex", flexDirection: "column", gap: 10 }}>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid var(--border-2)", fontSize: 13 }}
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="scam">Scam / Fraud</option>
                                    <option value="prohibited">Prohibited Item</option>
                                    <option value="spam">Spam / Multiple Posts</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="other">Other</option>
                                </select>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        disabled={!reportReason || reportStatus === "submitting"}
                                        onClick={async () => {
                                            setReportStatus("submitting");
                                            try {
                                                const res = await fetch("/api/reports", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ listingId: listing._id, reason: reportReason })
                                                });
                                                if (res.ok) setReportStatus("success");
                                                else setReportStatus("error");
                                            } catch { setReportStatus("error"); }
                                        }}
                                        style={{ flex: 1, padding: "8px", background: "var(--ink)", color: "white", borderRadius: 4, border: "none", fontSize: 12, cursor: "pointer" }}
                                    >
                                        {reportStatus === "submitting" ? "..." : "Submit"}
                                    </button>
                                    <button
                                        onClick={() => setIsReporting(false)}
                                        style={{ flex: 1, padding: "8px", background: "var(--bg-2)", color: "var(--ink)", borderRadius: 4, border: "none", fontSize: 12, cursor: "pointer" }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    if (!user) { router.push("/login"); return; }
                                    setIsReporting(true);
                                }}
                                style={{ width: "100%", background: "none", border: "none", color: "var(--red)", fontSize: 12, textDecoration: "underline", cursor: "pointer", opacity: 0.7 }}
                            >
                                Report this Ad
                            </button>
                        )}
                    </div>
                </section>

                <footer style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-4)" }}>
                    <span>Post Date: {new Date(createdAt).toLocaleDateString()}</span>
                </footer>
            </div>

        </div>
    );
}
