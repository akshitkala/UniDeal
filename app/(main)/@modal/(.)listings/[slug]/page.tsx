"use client";

import { useRouter } from "next/navigation";
import ListingDetailView from "@/components/listing/ListingDetailView";
import { useEffect, use } from "react";

export default function ListingModal({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const router = useRouter();
    const { slug } = use(params);

    useEffect(() => {
        // Disable body scroll when modal is open
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div
            onClick={() => router.back()}
            style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.6)", zIndex: 1000,
                display: "flex", alignItems: "flex-end", justifyContent: "center",
                animation: "fadeUp 0.3s var(--ease)"
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%", maxWidth: 1000, height: "90dvh",
                    background: "var(--surface)", borderTopLeftRadius: "var(--r-xl)",
                    borderTopRightRadius: "var(--r-xl)", position: "relative",
                    overflow: "auto", boxShadow: "var(--shadow-lg)"
                }}
            >
                <button
                    onClick={() => router.back()}
                    style={{
                        position: "absolute", top: 20, right: 20, zIndex: 10,
                        width: 36, height: 36, borderRadius: "50%",
                        background: "var(--bg-2)", border: "none", cursor: "pointer",
                        fontSize: 20, fontWeight: 700, display: "flex",
                        alignItems: "center", justifyContent: "center"
                    }}
                >
                    ×
                </button>
                <ListingDetailView slug={slug} isModal={true} />
            </div>
        </div>
    );
}
