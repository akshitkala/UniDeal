"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

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

    return (
        <Link
            href={`/listings/${slug}`}
            scroll={false}
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--r-md)",
                boxShadow: "var(--shadow-sm)",
                cursor: "pointer",
                overflow: "hidden",
                textDecoration: "none",
                transition: "transform 0.2s var(--ease), box-shadow 0.2s var(--ease)",
            }}
            className="listing-card"
        >
            <style dangerouslySetInnerHTML={{
                __html: `
        .listing-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .listing-card:hover .card-img {
          transform: scale(1.04);
        }
        @media (hover: none) {
          .listing-card:active {
            transform: scale(0.98);
          }
        }
      `}} />

            {/* Image Zone */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
                <Image
                    src={images[0] || "/placeholder-listing.png"}
                    alt={title}
                    fill
                    className="card-img"
                    style={{ objectFit: "cover", transition: "transform 0.2s var(--ease)" }}
                />

                {/* Overlays */}
                <div style={{
                    position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)", color: "white", padding: "2px 8px",
                    borderRadius: 4, fontSize: 10, fontWeight: 500
                }}>
                    👁 {views}
                </div>

                {negotiable && (
                    <div style={{
                        position: "absolute", bottom: 8, right: 8, background: "var(--amber)",
                        color: "white", padding: "2px 8px", borderRadius: 4,
                        fontSize: 10, fontWeight: 600, boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                        Negotiable
                    </div>
                )}

                {listing.seller?.emailVerified && (
                    <div style={{
                        position: "absolute", top: 8, right: 8, background: "white",
                        color: "var(--blue)", padding: "2px 4px", borderRadius: "50%",
                        fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)", border: "1px solid var(--border-2)"
                    }} title="Verified Student">
                        ✓
                    </div>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: "14px 14px" }}>
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

                {/* Footer */}
                <div style={{
                    paddingTop: 12, borderTop: "1px solid var(--bg-2)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: 11, color: "var(--ink-4)"
                }}>
                    <span>📍 {location || "LPU Campus"}</span>
                    <span>{formatDistanceToNow(new Date(createdAt))} ago</span>
                </div>
            </div>
        </Link>
    );
}
