"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get("sort") || "newest";

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value === "newest") {
            params.delete("sort");
        } else {
            params.set("sort", value);
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <select
            value={currentSort}
            onChange={handleSortChange}
            style={{
                padding: "6px 12px",
                borderRadius: "var(--r)",
                border: "1.5px solid var(--border-2)",
                background: "var(--surface)",
                fontSize: 13,
                color: "var(--ink-2)",
                cursor: "pointer",
                outline: "none",
            }}
        >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
        </select>
    );
}
