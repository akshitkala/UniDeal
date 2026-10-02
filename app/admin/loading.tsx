import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import PageHeaderSkeleton from '@/components/skeletons/PageHeaderSkeleton';

export default function AdminOverviewLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="space-y-6 max-w-3xl"
    >
      <span className="sr-only">Loading admin overview…</span>

      {/* Page Header */}
      <PageHeaderSkeleton />

      {/* 3 Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-border flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Larger Approval-Mode Toggle Card Block */}
      <div className="bg-white p-6 rounded-lg border border-border space-y-6" aria-hidden="true">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full sm:w-4/5" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="p-4 rounded-lg border border-border space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
