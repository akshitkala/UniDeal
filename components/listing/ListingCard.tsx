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

export default function ListingCard({ listing }: Props) {
    const { title, price, negotiable, condition, images, location, createdAt, views, slug } = listing;
    const { user } = useAuth();
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const [isSaved, setIsSaved] = useState(listing.isSaved || false);

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push("/login");
            return;
        }

        const previousState = isSaved;
        setIsSaved(!previousState);

        try {
            const res = await fetch(`/api/listings/${slug}/save`, { method: "POST" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setIsSaved(data.saved);
        } catch (err) {
            setIsSaved(previousState);
        }
    };

    return (
        <Link
            href={`/listings/${slug}`}
            scroll={false}
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
                <Image
                    src={images[0] || "/placeholder-listing.png"}
                    alt={title}
                    fill
                    style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                />

                <div style={{
                    position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)", color: "white", padding: "2px 8px",
                    borderRadius: 4, fontSize: 10, fontWeight: 500
                }}>
                    👁 {views}
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        position: "absolute", bottom: 8, left: 8, background: "white",
                        width: 28, height: 28, borderRadius: "50%", display: "flex",
                        alignItems: "center", justifyContent: "center", border: "1px solid var(--border-2)",
                        boxShadow: "var(--shadow-sm)", cursor: "pointer", fontSize: 14,
                        color: isSaved ? "var(--amber)" : "var(--ink-4)", zIndex: 10
                    }}
                >
                    {isSaved ? "🔖" : "♡"}
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: isMobile ? "10px" : "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isMobile ? 4 : 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: isMobile ? 14 : 16, color: "var(--ink)" }}>
                        ₹{price.toLocaleString("en-IN")}
                    </span>
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
        </Link>
    );
}
