import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import PageHeaderSkeleton from '@/components/skeletons/PageHeaderSkeleton';
import ListingGridSkeleton from '@/components/skeletons/ListingGridSkeleton';

export default function BrowseLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <span className="sr-only">Loading marketplace…</span>

      {/* Page Header */}
      <PageHeaderSkeleton />

      {/* Filters Bar Skeleton */}
      <div aria-hidden="true" className="space-y-4 mb-6">
        {/* Search, Filter button, Sort dropdown */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-11 flex-1 rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-24 sm:hidden rounded-md" />
            <Skeleton className="h-11 w-[170px] rounded-md" />
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Skeleton className="h-8 w-24 rounded-full shrink-0" />
          <Skeleton className="h-8 w-20 rounded-full shrink-0" />
          <Skeleton className="h-8 w-28 rounded-full shrink-0" />
          <Skeleton className="h-8 w-24 rounded-full shrink-0" />
          <Skeleton className="h-8 w-20 rounded-full shrink-0" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <ListingGridSkeleton count={8} />
    </div>
  );
}
