'use client';

import { useState, useEffect, useCallback } from 'react';
import ListingCard from "./ListingCard";
import SkeletonCard from "./SkeletonCard";

interface ListingsInfiniteGridProps {
    initialListings: any[];
    searchParams: any;
    savedIds: string[];
}

export default function ListingsInfiniteGrid({ initialListings, searchParams, savedIds }: ListingsInfiniteGridProps) {
    const [listings, setListings] = useState<any[]>(initialListings);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const { search, category, condition, sort } = searchParams;

    const fetchListings = useCallback(async (pageNum: number, replace = false) => {
        const params = new URLSearchParams({
            page: String(pageNum),
            limit: '12',
            ...(search && { search }),
            ...(category && { category }),
            ...(condition && { condition }),
            ...(sort && { sort }),
        });

        const res = await fetch(`/api/listings?${params}`);
        const data = await res.json();

        const savedSet = new Set(savedIds);
        const newListings = data.listings.map((l: any) => ({
            ...l,
            isSaved: savedSet.has(l._id.toString())
        }));

        setListings(prev => replace ? newListings : [...prev, ...newListings]);
        setHasMore(data.pagination.hasMore);
    }, [search, category, condition, sort, savedIds]);

    // Initial load and filter changes — replace listings
    useEffect(() => {
        // Skip first render since we have initialListings
        if (page === 1 && listings === initialListings) return;

        setPage(1);
        fetchListings(1, true);
    }, [search, category, condition, sort]);

    // Infinite scroll — append
    useEffect(() => {
        if (page === 1) return;
        setLoadingMore(true);
        fetchListings(page).finally(() => setLoadingMore(false));
    }, [page]);

    // Scroll listener
    useEffect(() => {
        function onScroll() {
            if (loadingMore || !hasMore) return;
            const nearBottom =
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
            if (nearBottom) setPage(p => p + 1);
        }
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [loadingMore, hasMore]);

    return (
        <>
            <style>{`
                .listings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                    padding: 0 12px 40px;
                }
                @media (min-width: 480px) {
                    .listings-grid {
                        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                        gap: 16px;
                        padding: 0 20px 40px;
                    }
                }
                @media (min-width: 768px) {
                    .listings-grid {
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    }
                }
            `}</style>

            <div className="listings-grid">
                {listings.map(l => (
                    <ListingCard
                        key={l._id}
                        listing={l}
                    />
                ))}

                {loadingMore && (
                    <div style={{
                        gridColumn: '1 / -1',
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '24px 0',
                    }}>
                        <div style={{
                            width: 28, height: 28,
                            border: '3px solid var(--border)',
                            borderTopColor: 'var(--ink)',
                            borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite',
                        }} />
                    </div>
                )}

                {!hasMore && listings.length > 0 && (
                    <p style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        fontSize: 13,
                        color: 'var(--ink-4)',
                        padding: '24px 0',
                    }}>
                        You've seen all listings
                    </p>
                )}
            </div>
        </>
    );
}
