import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

interface PageHeaderSkeletonProps {
  hasSubtitle?: boolean;
  className?: string;
}

export default function PageHeaderSkeleton({
  hasSubtitle = true,
  className = 'mb-6',
}: PageHeaderSkeletonProps) {
  return (
    <div aria-hidden="true" className={`space-y-2 ${className}`}>
      <Skeleton className="h-8 w-48 sm:w-64" />
      {hasSubtitle && <Skeleton className="h-4 w-64 sm:w-96" />}
    </div>
  );
}
