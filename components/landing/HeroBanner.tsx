"use client";

import Link from "next/link";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface HeroBannerProps {
    recentImages: string[];
}

export default function HeroBanner({ recentImages }: HeroBannerProps) {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    const handleExplore = () => {
        const listingsSection = document.getElementById("listings-section");
        if (listingsSection) {
            listingsSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section style={{
            background: "#f0fdf4",
            borderRadius: "20px",
            padding: isMobile ? "24px 20px" : "36px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            position: "relative",
            overflow: "hidden"
        }}>
            <div style={{ flex: 1, maxWidth: isMobile ? "100%" : "60%" }}>
                <h1 style={{
                    fontSize: isMobile ? "1.5rem" : "2.5rem",
                    fontWeight: 800,
                    color: "#14532d",
                    lineHeight: 1.1,
                    marginBottom: "12px"
                }}>
                    Find Your Next Campus Deal
                </h1>
                <p style={{
                    fontSize: isMobile ? "1rem" : "1.1rem",
                    color: "#166534",
                    marginBottom: "8px",
                    fontWeight: 500
                }}>
                    The exclusive marketplace for LPU students.
                </p>
                <p style={{
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    color: "#166534",
                    marginBottom: "24px",
                    opacity: 0.9
                }}>
                    Buy, sell, and trade with ease.
                </p>
                <button
                    onClick={handleExplore}
                    style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: "999px",
                        padding: "12px 28px",
                        fontWeight: 700,
                        fontSize: "1rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
                        transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    Explore Now
                </button>
            </div>

            {!isMobile && (
                <div style={{
                    width: "280px",
                    height: "280px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "1fr 1fr",
                    gap: "12px",
                    flexShrink: 0,
                    marginLeft: "40px"
                }}>
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "12px",
                                background: recentImages[i] ? "none" : "#dcfce7",
                                overflow: "hidden",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                            }}
                        >
                            {recentImages[i] ? (
                                <img
                                    src={recentImages[i]}
                                    alt=""
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <div style={{ width: "100%", height: "100%", background: `hsl(${i * 45 + 120}, 60%, 80%)` }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
