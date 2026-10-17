'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ListingFilters from '@/components/filters/ListingFilters';
import ListingGrid from '@/components/listing/ListingGrid';
import type { ListingCardData } from '@/components/listing/ListingCard';
import type { ListingCondition } from '@/types/domain';
import { useAuth } from '@/contexts/AuthContext';
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

interface BrowseClientProps {
  initialCategories: CategoryItem[];
  initialListings: ListingCardData[];
  initialPagination: PaginationMeta;
  initialQueryKey: string;
}

interface BrowseCacheEntry {
  listings: ListingCardData[];
  page: number;
  pagination: PaginationMeta;
  scrollY: number;
  queryKey: string;
  timestamp: number;
}

const CACHE_KEY = 'unideal_browse_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default function BrowseClient({
  initialCategories,
  initialListings,
  initialPagination,
  initialQueryKey,
}: BrowseClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const currentQueryKey = searchParams.toString();

  // Determine if returning via browser Back/Forward navigation
  const isBackNavigationRef = useRef(false);
  const cacheRestoredRef = useRef(false);

  // Check cache synchronously before initial render state if possible
  const getValidCache = useCallback((): BrowseCacheEntry | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed: BrowseCacheEntry = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      if (parsed.queryKey !== currentQueryKey) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [currentQueryKey]);

  // State initialization
  const [categories] = useState<CategoryItem[]>(initialCategories);
  const [listings, setListings] = useState<ListingCardData[]>(initialListings);
  const [page, setPage] = useState<number>(initialPagination.page || 1);
  const [pagination, setPagination] = useState<PaginationMeta>(initialPagination);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFirstMountRef = useRef(true);

  // URL query params
  const categoryParam = searchParams.get('category');
  const conditionParam = searchParams.get('condition') as ListingCondition | null;
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  // 1. Clear cache on sign-in / sign-out
  const prevUserRef = useRef(user?.id);
  useEffect(() => {
    if (prevUserRef.current !== user?.id) {
      prevUserRef.current = user?.id;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
  }, [user?.id]);

  // 2. Clear cache when query params change
  const prevQueryKeyRef = useRef(currentQueryKey);
  useEffect(() => {
    if (prevQueryKeyRef.current !== currentQueryKey) {
      prevQueryKeyRef.current = currentQueryKey;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(CACHE_KEY);
      }
      // Reset to server-rendered initial data for the new query
      setListings(initialListings);
      setPage(initialPagination.page || 1);
      setPagination(initialPagination);
    }
  }, [currentQueryKey, initialListings, initialPagination]);

  // 3. Save cache when navigating away (e.g. clicking a listing link)
  const saveCurrentBrowseCache = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      // Cap at 100 listings
      const cappedListings = listings.slice(0, 100);
      const entry: BrowseCacheEntry = {
        listings: cappedListings,
        page,
        pagination,
        scrollY,
        queryKey: currentQueryKey,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
      sessionStorage.setItem('unideal_browse_left_to_listing', 'true');
    } catch (e) {
      console.warn('Failed to save browse cache:', e);
    }
  }, [listings, page, pagination, currentQueryKey]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentBrowseCache();
    };

    // Also intercept internal clicks on listing cards and nav links
    const handleClick = (e: MouseEvent) => {
      const listingLink = (e.target as HTMLElement).closest('a[href^="/listing/"]');
      if (listingLink) {
        saveCurrentBrowseCache();
        return;
      }
      const browseNav = (e.target as HTMLElement).closest('header a[href="/browse"]');
      if (browseNav) {
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem('unideal_browse_left_to_listing');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [saveCurrentBrowseCache]);

  // 4. Handle Back-Navigation detection & restoration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set scroll restoration to manual for this page so we control it
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const cached = getValidCache();

    // Check if user is navigating back/forward
    // In SPAs with Next.js router, popstate or active cached state from previous route transition indicates back navigation
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const navType = navEntries.length > 0 ? navEntries[0].type : '';
    const isHardBackForward = navType === 'back_forward';

    // A valid cache with matching query string that was saved while viewing a listing indicates returning to Browse
    if (cached && (isHardBackForward || sessionStorage.getItem('unideal_browse_left_to_listing') === 'true')) {
      sessionStorage.removeItem('unideal_browse_left_to_listing');
      isBackNavigationRef.current = true;
      cacheRestoredRef.current = true;

      // Restore cards immediately with no skeleton
      setListings(cached.listings);
      setPage(cached.page);
      setPagination(cached.pagination);

      // Restore scroll position after DOM renders cards
      const targetY = cached.scrollY;
      const doScroll = () => {
        window.scrollTo(0, targetY);
        document.documentElement.scrollTop = targetY;
        document.body.scrollTop = targetY;
      };
      doScroll();
      requestAnimationFrame(doScroll);
      setTimeout(doScroll, 30);
      setTimeout(doScroll, 100);

      // Silent background refresh of page 1 without jumping scroll position
      (async () => {
        setIsRefreshing(true);
        try {
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', '1');
          const res = await fetch(`/api/listings?${params.toString()}`);
          const json = await res.json();

          if (res.ok && json.data?.listings) {
            const freshPage1: ListingCardData[] = json.data.listings;
            const freshPage1Map = new Map<string, ListingCardData>(
              freshPage1.map((item) => [item.id, item])
            );

            setListings((current) => {
              // Replace updated cards, remove sold/missing items from page 1 range
              const updated = current
                .map((item) => {
                  if (freshPage1Map.has(item.id)) {
                    return freshPage1Map.get(item.id)!;
                  }
                  return item;
                })
                .filter((item) => {
                  // If item was on page 1 originally but is no longer in fresh approved page 1
                  if (current.indexOf(item) < 20 && !freshPage1Map.has(item.id)) {
                    return false;
                  }
                  return true;
                });

              // Prepend any new listings from fresh page 1 not currently in state
              const currentIds = new Set(updated.map((u) => u.id));
              const brandNew = freshPage1.filter((f) => !currentIds.has(f.id));
              return [...brandNew, ...updated];
            });

            if (json.data.pagination) {
              setPagination(json.data.pagination);
            }
          }
        } catch {
          // Silent refresh error is harmless
        } finally {
          setIsRefreshing(false);
        }
      })();
    } else {
      // Normal arrival (e.g. clicking Browse nav or logo)
      // Clear cache and ensure we start at the top
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem('unideal_browse_left_to_listing');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }

    return () => {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    };
  }, [getValidCache, searchParams]);

  // 5. Load next page of listings (Infinite Scroll)
  const loadMoreListings = useCallback(async () => {
    if (loadingMore || isRefreshing) return;
    if (pagination && page >= pagination.totalPages) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', nextPage.toString());

      const res = await fetch(`/api/listings?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.data?.listings) {
        setListings((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const newUnique = json.data.listings.filter(
            (item: ListingCardData) => !existingIds.has(item.id)
          );
          return [...prev, ...newUnique];
        });
        setPage(nextPage);
        if (json.data.pagination) {
          setPagination(json.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load more listings:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, isRefreshing, pagination, page, searchParams]);

  // 6. IntersectionObserver for Infinite Scroll
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
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [loadMoreListings]);

  // URL param updater
  const updateQueryParam = (key: string, value: string | null) => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CACHE_KEY);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearAll = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CACHE_KEY);
    }
    router.push(pathname, { scroll: false });
  };

  const hasMore = pagination ? page < pagination.totalPages : false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
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

      {/* Listings Grid (Server-Rendered First Page, Zero Skeletons on initial arrival) */}
      <ListingGrid
        listings={listings}
        loading={false}
        loadingMore={loadingMore}
        onClearFilters={handleClearAll}
      />

      {/* Infinite Scroll Trigger Sentinel & Status Indicator */}
      {listings.length > 0 && (
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
