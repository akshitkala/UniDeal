'use client';

import React from 'react';
import ListingCard, { ListingCardData } from './ListingCard';
import ListingGridSkeleton, {
  LISTING_GRID_CLASSES,
} from '@/components/skeletons/ListingGridSkeleton';
import ListingCardSkeleton from '@/components/skeletons/ListingCardSkeleton';
import { PackageOpen } from 'lucide-react';

interface ListingGridProps {
  listings: ListingCardData[];
  loading?: boolean;
  loadingMore?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
}

export default function ListingGrid({
  listings,
  loading = false,
  loadingMore = false,
  emptyTitle = 'No listings match these filters',
  emptyDescription = 'Try adjusting your search keywords, category, or condition filters.',
  onClearFilters,
}: ListingGridProps) {
  if (loading && listings.length === 0) {
    return <ListingGridSkeleton count={8} />;
  }

  if (!loading && listings.length === 0) {
    return (
      <div className="py-16 px-4 text-center rounded-lg border border-dashed border-border bg-surface/50 max-w-lg mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-surface border border-border text-neutral-muted flex items-center justify-center mx-auto mb-3">
          <PackageOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-neutral-text font-heading">
          {emptyTitle}
        </h3>
        <p className="text-sm text-neutral-muted mt-1 leading-relaxed max-w-sm mx-auto">
          {emptyDescription}
        </p>
        {onClearFilters && (
          <div className="mt-4">
            <button
              type="button"
              onClick={onClearFilters}
              className="py-2 px-4 rounded-md bg-white border border-border hover:bg-surface text-sm font-medium text-neutral-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[40px]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={LISTING_GRID_CLASSES}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
      {loadingMore &&
        Array.from({ length: 4 }).map((_, i) => (
          <ListingCardSkeleton key={`loading-more-${i}`} />
        ))}
    </div>
  );
}

