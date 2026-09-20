'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ListingFilters from '@/components/filters/ListingFilters';
import ListingGrid from '@/components/listing/ListingGrid';
import type { ListingCardData } from '@/components/listing/ListingCard';
import type { ListingCondition } from '@/types/domain';
import { createClient } from '@/lib/supabase/client';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Read URL query params
  const categoryParam = searchParams.get('category');
  const conditionParam = searchParams.get('condition') as ListingCondition | null;
  const searchParam = searchParams.get('search') || '';
  const sortParam = searchParams.get('sort') || 'newest';

  // Load categories
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

  // Fetch listings from /api/listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryParam) params.set('category', categoryParam);
      if (conditionParam) params.set('condition', conditionParam);
      if (searchParam) params.set('search', searchParam);
      if (sortParam) params.set('sort', sortParam);

      const res = await fetch(`/api/listings?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.data?.listings) {
        setListings(json.data.listings);
      } else {
        setListings([]);
      }
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [categoryParam, conditionParam, searchParam, sortParam]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
          Campus Marketplace
        </h1>
        <p className="text-sm text-neutral-muted mt-1">
          Browse items listed by verified students on campus.
        </p>
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
        onClearFilters={handleClearAll}
      />
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
