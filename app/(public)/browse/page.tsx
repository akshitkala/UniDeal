import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchServerCategories, fetchServerListings } from '@/lib/server-listings';
import type { ListingCondition } from '@/types/domain';
import BrowseClient from './BrowseClient';

export const metadata: Metadata = {
  title: 'Campus Marketplace — UniDeal',
  description: 'Browse second-hand items listed by verified students on campus.',
};

// Force dynamic rendering so server reads fresh searchParams per request
export const dynamic = 'force-dynamic';

interface BrowsePageProps {
  searchParams: {
    category?: string;
    condition?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const categorySlug = searchParams.category || null;
  const condition = (searchParams.condition as ListingCondition) || null;
  const search = searchParams.search || null;
  const sort = searchParams.sort || 'newest';

  // Fetch initial first page on server
  const [categories, { listings, pagination }] = await Promise.all([
    fetchServerCategories(),
    fetchServerListings({
      categorySlug,
      condition,
      search,
      sort,
      page: 1,
      limit: 20,
    }),
  ]);

  const queryKey = new URLSearchParams(
    Object.entries(searchParams).reduce((acc, [k, v]) => {
      if (v) acc[k] = v;
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
              Campus Marketplace
            </h1>
            <p className="text-sm text-neutral-muted mt-1">
              Browse items listed by verified students on campus.
            </p>
          </div>
        </div>
      }
    >
      <BrowseClient
        initialCategories={categories}
        initialListings={listings}
        initialPagination={pagination}
        initialQueryKey={queryKey}
      />
    </Suspense>
  );
}
