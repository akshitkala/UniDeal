import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function ListingDetailLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      <span className="sr-only">Loading item details…</span>

      {/* Back to Browse Skeleton */}
      <div className="mb-6" aria-hidden="true">
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start" aria-hidden="true">
        {/* Left Column: Image Gallery Skeleton (md:col-span-7) */}
        <div className="md:col-span-7 space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>

        {/* Right Column: Listing Details & Actions Skeleton (md:col-span-5) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-border space-y-4">
            {/* Category & Views */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-3/4" />
            </div>

            {/* Price & Negotiable Badge */}
            <div className="flex items-center gap-3 pt-1">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Condition Badge */}
            <div className="pt-2 border-t border-border flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Seller Trust Box */}
            <div className="p-3.5 rounded-md bg-surface border border-border flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>

            {/* Neutral Contact Seller Button Block (No accent color!) */}
            <div className="pt-2 space-y-2">
              <Skeleton className="h-11 w-full rounded-md min-h-[44px]" />
              <Skeleton className="h-3 w-4/5 mx-auto" />
            </div>
          </div>

          {/* Description Card Skeleton */}
          <div className="bg-white p-6 rounded-lg border border-border space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
