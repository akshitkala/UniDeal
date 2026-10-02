import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import PageHeaderSkeleton from '@/components/skeletons/PageHeaderSkeleton';

export default function ProfileLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="container mx-auto px-4 py-10 max-w-xl"
    >
      <span className="sr-only">Loading profile…</span>

      {/* Page Header */}
      <PageHeaderSkeleton className="mb-8" />

      {/* 4 Field Skeletons */}
      <div className="space-y-5" aria-hidden="true">
        {/* Full Name */}
        <div>
          <Skeleton className="h-4 w-24 mb-1.5" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* Branch */}
        <div>
          <Skeleton className="h-4 w-32 mb-1.5" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* Year */}
        <div>
          <Skeleton className="h-4 w-28 mb-1.5" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* WhatsApp Number */}
        <div>
          <Skeleton className="h-4 w-36 mb-1.5" />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-3 w-64 mt-1.5" />
        </div>

        {/* Save Changes Button Block */}
        <Skeleton className="h-11 w-32 rounded-md min-h-[44px]" />
      </div>
    </div>
  );
}
