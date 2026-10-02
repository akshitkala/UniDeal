import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import PageHeaderSkeleton from '@/components/skeletons/PageHeaderSkeleton';

export default function SellLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="container mx-auto px-4 py-8 max-w-2xl"
    >
      <span className="sr-only">Loading sell form…</span>

      {/* Page Header */}
      <PageHeaderSkeleton className="mb-6" />

      {/* Form Fields in design.md §7.6 order */}
      <div className="space-y-6" aria-hidden="true">
        {/* 1. Title */}
        <div>
          <Skeleton className="h-4 w-24 mb-1.5" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* 2. Category */}
        <div>
          <Skeleton className="h-4 w-24 mb-1.5" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* 3. Condition */}
        <div>
          <Skeleton className="h-4 w-24 mb-1.5" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>

        {/* 4. Price */}
        <div>
          <Skeleton className="h-4 w-20 mb-1.5" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* 5. Negotiable toggle */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* 6. Description (taller block) */}
        <div>
          <Skeleton className="h-4 w-28 mb-1.5" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>

        {/* 7. Image Upload Area */}
        <div>
          <Skeleton className="h-4 w-32 mb-1.5" />
          <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed border-border" />
        </div>

        {/* 8. Submit button block */}
        <Skeleton className="h-11 w-full rounded-md min-h-[44px]" />
      </div>
    </div>
  );
}
