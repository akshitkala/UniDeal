import React from 'react';
import ListingCardSkeleton from './ListingCardSkeleton';

export const LISTING_GRID_CLASSES =
  'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4';

interface ListingGridSkeletonProps {
  count?: number;
  className?: string;
}

export default function ListingGridSkeleton({
  count = 8,
  className = '',
}: ListingGridSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`${LISTING_GRID_CLASSES} ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
