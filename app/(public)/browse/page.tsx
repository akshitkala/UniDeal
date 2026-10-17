'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ListingFilters from '@/components/filters/ListingFilters';
import ListingGrid from '@/components/listing/ListingGrid';
import type { ListingCardData } from '@/components/listing/ListingCard';
import type { ListingCondition } from '@/types/domain';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  // Sentinel ref for infinite scroll IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Read URL query params
  const categoryParam = searchParams.get('category');
  const conditionParam = searchParams.get('condition') as ListingCondition | null;
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  // Load categories once
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('id');
      if (data) {
        setCategories(data);
      }
    }
    loadCategories();
  }, [supabase]);

  // Initial fetch when filters/search/sort change (resets to page 1)
  const fetchInitialListings = useCallback(async () => {
    setLoading(true);
    setPage(1);
    try {
      const params = new URLSearchParams();
      if (categoryParam) params.set('category', categoryParam);
      if (conditionParam) params.set('condition', conditionParam);
      if (searchParam) params.set('search', searchParam);
      if (sortParam) params.set('sort', sortParam);
      params.set('page', '1');

      const res = await fetch(`/api/listings?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.data?.listings) {
        setListings(json.data.listings);
        setPagination(json.data.pagination || null);
      } else {
        setListings([]);
        setPagination(null);
      }
    } catch {
      setListings([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [categoryParam, conditionParam, searchParam, sortParam]);

  useEffect(() => {
    fetchInitialListings();
  }, [fetchInitialListings]);

  // Load next page of listings
  const loadMoreListings = useCallback(async () => {
    if (loading || loadingMore) return;
    if (pagination && page >= pagination.totalPages) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams();
      if (categoryParam) params.set('category', categoryParam);
      if (conditionParam) params.set('condition', conditionParam);
      if (searchParam) params.set('search', searchParam);
      if (sortParam) params.set('sort', sortParam);
      params.set('page', nextPage.toString());

      const res = await fetch(`/api/listings?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.data?.listings) {
        setListings((prev) => {
          // Prevent duplicates by checking id
          const existingIds = new Set(prev.map((item) => item.id));
          const newUnique = json.data.listings.filter(
            (item: ListingCardData) => !existingIds.has(item.id)
          );
          return [...prev, ...newUnique];
        });
        setPage(nextPage);
        setPagination(json.data.pagination || null);
      }
    } catch (err) {
      console.error('Failed to load more listings:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    loading,
    loadingMore,
    pagination,
    page,
    categoryParam,
    conditionParam,
    searchParam,
    sortParam,
  ]);

  // IntersectionObserver to trigger loadMore when user scrolls to sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMoreListings();
        }
      },
      { rootMargin: '300px' } // Pre-fetch 300px before bottom is reached
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [loadMoreListings]);

  // Helper to update query parameters in URL
  const updateQueryParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const hasMore = pagination ? page < pagination.totalPages : false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
            Campus Marketplace
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Browse items listed by verified students on campus.
          </p>
        </div>

        {pagination && pagination.total > 0 && (
          <div className="text-xs sm:text-sm font-medium text-neutral-muted bg-neutral-100/80 px-3 py-1.5 rounded-full self-start sm:self-auto border border-border">
            Showing {listings.length} of {pagination.total} items
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <ListingFilters
        categories={categories}
        selectedCategory={categoryParam}
        onSelectCategory={(slug) => updateQueryParam('category', slug)}
        selectedCondition={conditionParam}
        onSelectCondition={(cond) => updateQueryParam('condition', cond)}
        searchQuery={searchParam}
        onSearchChange={(query) => updateQueryParam('search', query ? query : null)}
        selectedSort={sortParam}
        onSortChange={(sort) => updateQueryParam('sort', sort)}
        onClearAll={handleClearAll}
      />

      {/* Listings Grid */}
      <ListingGrid
        listings={listings}
        loading={loading}
        loadingMore={loadingMore}
        onClearFilters={handleClearAll}
      />

      {/* Infinite Scroll Trigger Sentinel & Status Indicator */}
      {!loading && listings.length > 0 && (
        <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center">
          {hasMore && (
            <div className="flex items-center gap-2 text-sm text-neutral-muted">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading more items...</span>
            </div>
          )}

          {!hasMore && (
            <div className="text-center text-xs text-neutral-muted py-4 border-t border-border/60 w-full max-w-md">
              You&apos;ve reached the end of the marketplace ({listings.length} items loaded)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-neutral-muted">
          Loading marketplace...
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
