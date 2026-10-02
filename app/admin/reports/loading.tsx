import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import PageHeaderSkeleton from '@/components/skeletons/PageHeaderSkeleton';

export default function AdminReportsLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="space-y-6 max-w-4xl"
    >
      <span className="sr-only">Loading reports…</span>

      {/* Page Header */}
      <PageHeaderSkeleton />

      {/* 6 Report Item Rows Skeleton */}
      <div className="space-y-4" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 bg-white rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              </div>

              {/* Action Buttons (Remove / Dismiss) */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Skeleton className="h-9.5 w-32 rounded-md min-h-[38px]" />
                <Skeleton className="h-9.5 w-28 rounded-md min-h-[38px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
