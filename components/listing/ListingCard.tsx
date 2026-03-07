'use client'

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface Props {
    listing: any;
}

const conditionColors: any = {
    new: "var(--green)",
    "like-new": "var(--blue)",
    good: "var(--amber)",
    used: "#6b7280",
    damaged: "var(--red)",
};

const conditionBgColors: any = {
    new: "var(--green-bg)",
    "like-new": "var(--blue-bg)",
    good: "var(--amber-bg)",
    used: "#f3f4f6",
    damaged: "var(--red-bg)",
};

import { useListingDrawer } from "./ListingDrawerContext";

function optimizeImage(url: string, width = 400): string {
    if (!url?.includes('res.cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto,c_fill/`);
}

export default function ListingCard({ listing }: Props) {
    const { title, price, negotiable, condition, images, location, createdAt, slug } = listing;
    const { user } = useAuth();
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const [isSaved, setIsSaved] = useState(listing.isSaved ?? false);
    const { openListing } = useListingDrawer();

    async function handleSave(e: React.MouseEvent) {
        e.stopPropagation(); // don't open the listing drawer
        e.preventDefault();

        if (!user) {
            router.push('/login');
            return;
        }

        const prev = isSaved;
        setIsSaved(!prev); // optimistic update

        try {
            const res = await fetch(`/api/listings/${slug}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setIsSaved(data.saved);
        } catch {
            setIsSaved(prev); // revert on error
        }
    }

    const handleClick = (e: React.MouseEvent) => {
        // Only trigger drawer if it's a normal click (not cmd/ctrl/middle-click)
        if (e.metaKey || e.ctrlKey || e.button === 1) return;

        e.preventDefault();
        openListing(slug, listing);
        // Optionally update URL to match
        window.history.pushState(null, '', `/listings/${slug}`);
    };

    return (
        <a
            href={`/listings/${slug}`}
            onClick={handleClick}
            style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
                background: "var(--surface)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--r-md)",
                boxShadow: "var(--shadow-sm)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "transform 0.2s var(--ease), box-shadow 0.2s var(--ease)",
                position: "relative",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
            }}
        >
            {/* Image Zone */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
                <img
                    src={optimizeImage(images[0] || "/placeholder-listing.png", 400)}
                    alt={title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: "cover", transition: "transform 0.3s ease" }}
                />

                <button
                    onClick={handleSave}
                    style={{
                        position: 'absolute',
                        top: 8, right: 8,
                        width: 32, height: 32,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)', // Safari
                        border: 'none',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        transition: 'all 180ms',
                        zIndex: 1,
                    }}
                    aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{
                            fontSize: 18,
                            color: isSaved ? '#d97706' : '#6b7280',
                            fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                            transition: 'all 180ms',
                        }}
                    >bookmark</span>
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: isMobile ? "10px" : "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 4 : 8 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: isMobile ? 14 : 16, color: "var(--ink)" }}>
                            ₹{price.toLocaleString("en-IN")}
                        </span>
                        {listing.category?.name && (
                            <span style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>
                                {listing.category.name}
                            </span>
                        )}
                    </div>
                    {!isMobile && (
                        <span style={{
                            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                            padding: "2px 8px", borderRadius: 4,
                            background: conditionBgColors[condition],
                            color: conditionColors[condition]
                        }}>
                            {condition.replace("-", " ")}
                        </span>
                    )}
                </div>

                <h3 style={{
                    fontSize: isMobile ? 12 : 13, color: "var(--ink-2)", lineHeight: 1.4,
                    height: isMobile ? "2.8em" : "2.8em", overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: isMobile ? 8 : 12,
                    fontWeight: isMobile ? 500 : 400
                }}>
                    {title}
                </h3>

                <div style={{
                    paddingTop: isMobile ? 8 : 12, borderTop: "1px solid var(--bg-2)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: 10, color: "var(--ink-4)"
                }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>📍 {location || "LPU"}</span>
                    {!isMobile && <span>{formatDistanceToNow(new Date(createdAt))} ago</span>}
                </div>
            </div>
        </a>
    );
}
