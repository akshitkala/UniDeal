import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function ListingCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col bg-white rounded-lg border border-border overflow-hidden"
    >
      {/* Square Image Block */}
      <div className="relative aspect-square w-full bg-border/40 overflow-hidden">
        <Skeleton className="absolute top-2 left-2 w-14 h-5 rounded-full" />
      </div>

      {/* Card Content Block */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Price Line */}
          <Skeleton className="h-6 w-20" />
          {/* Title Lines */}
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </div>

        {/* Category & Seller Row */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-14" />
        </div>
      </div>
    </div>
  );
}
