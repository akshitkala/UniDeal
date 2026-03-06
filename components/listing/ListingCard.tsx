'use client'

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useRouter } from "next/navigation";

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

    const handleClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        router.push(`/listings/${slug}`, { scroll: false });
    };

    return (
        <div
            onClick={handleClick}
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--r-md)",
                boxShadow: "var(--shadow-sm)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "transform 0.2s var(--ease), box-shadow 0.2s var(--ease)",
                display: "block",
                position: 'relative'
            }}
            className="listing-card"
        >
            <style jsx>{`
                .listing-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                .listing-card:hover :global(.card-img) {
                    transform: scale(1.05);
                }
            `}</style>

            {/* Image Zone */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
                <Image
                    src={images[0] || "/placeholder-listing.png"}
                    alt={title}
                    fill
                    className="card-img"
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
            <div style={{ padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>
                        ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span style={{
                        fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                        padding: "2px 8px", borderRadius: 4,
                        background: conditionBgColors[condition],
                        color: conditionColors[condition]
                    }}>
                        {condition.replace("-", " ")}
                    </span>
                </div>

                <h3 style={{
                    fontSize: 13, color: "var(--ink-2)", lineHeight: 1.4,
                    height: "2.8em", overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 12,
                    fontWeight: 400
                }}>
                    {title}
                </h3>

                <div style={{
                    paddingTop: 12, borderTop: "1px solid var(--bg-2)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: 11, color: "var(--ink-4)"
                }}>
                    <span>📍 {location || "LPU Campus"}</span>
                    <span>{formatDistanceToNow(new Date(createdAt))} ago</span>
                </div>
            </div>
        </div>
    );
}
