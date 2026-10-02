import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import ListingGridSkeleton from '@/components/skeletons/ListingGridSkeleton';

export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      <span className="sr-only">Loading dashboard…</span>

      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>
        <Skeleton className="h-11 w-36 rounded-md shrink-0" />
      </div>

      {/* 4 Status Tabs Skeleton */}
      <div className="flex border-b border-border mb-6 overflow-x-auto pb-3 gap-3" aria-hidden="true">
        <Skeleton className="h-8 w-28 rounded-full shrink-0" />
        <Skeleton className="h-8 w-36 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-28 rounded-full shrink-0" />
      </div>

      {/* 4 Cards Skeleton */}
      <ListingGridSkeleton count={4} />
    </div>
  );
}
