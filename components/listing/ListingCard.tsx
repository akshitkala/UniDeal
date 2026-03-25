'use client'

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils/time";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface Props {
    listing: any;
}

const conditionColors: any = {
    new: "#10b981",       // Emerald
    "like-new": "#3b82f6", // Blue
    good: "#f59e0b",      // Amber
    fair: "#0d9488",      // Teal
    used: "#6b7280",      // Grey
};

function optimizeImage(url: string, width = 400): string {
    if (!url?.includes('res.cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto,c_fill/`);
}

export default function ListingCard({ listing }: Props) {
    const { title, price, condition, images, location, slug } = listing;
    const { user } = useAuth();
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const [isSaved, setIsSaved] = useState(listing.isSaved ?? false);

    async function handleSave(e: React.MouseEvent) {
        e.stopPropagation();
        e.preventDefault();

        if (!user) {
            router.push('/login');
            return;
        }

        const prev = isSaved;
        setIsSaved(!prev);

        try {
            const res = await fetch(`/api/listings/${slug}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setIsSaved(data.saved);
        } catch {
            setIsSaved(prev);
        }
    }

    return (
        <a
            href={`/listings/${slug}`}
            style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                background: "var(--surface)",
                borderRadius: "24px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "transform 0.2s var(--ease), box-shadow 0.2s var(--ease)",
                position: "relative",
                height: "100%",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
            }}
        >
            {/* Image Zone */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", overflow: "hidden" }}>
                <img
                    src={optimizeImage(images[0] || "/placeholder-listing.png", 400)}
                    alt={title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: "cover" }}
                />

                {/* Condition Badge */}
                <div style={{
                    position: 'absolute',
                    top: 12, left: 12,
                    background: conditionColors[condition] || conditionColors.used,
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                }}>
                    {condition.replace("-", " ")}
                </div>

                {/* Price Badge */}
                <div style={{
                    position: 'absolute',
                    top: 12, right: 12,
                    background: '#fff',
                    color: '#000',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 800,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                    ₹{price.toLocaleString("en-IN")}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    style={{
                        position: 'absolute',
                        bottom: 12, right: 12,
                        width: 36, height: 36,
                        borderRadius: '50%',
                        background: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                        transition: 'all 200ms',
                        zIndex: 1,
                    }}
                    aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{
                            fontSize: 20,
                            color: isSaved ? 'var(--primary)' : '#1f2937',
                            fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                        }}
                    >bookmark</span>
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{
                    fontSize: "15px",
                    color: "var(--ink)",
                    margin: "0 0 8px 0",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}>
                    {title}
                </h3>

                <div style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--ink-4)",
                    fontSize: "12px",
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {location || "Main Gate, LPU"}
                    </span>
                </div>
            </div>
        </a>
    );
}
