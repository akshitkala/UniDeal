import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

interface TableRowSkeletonProps {
  cols?: number;
  className?: string;
}

export default function TableRowSkeleton({
  cols = 4,
  className = '',
}: TableRowSkeletonProps) {
  return (
    <tr aria-hidden="true" className={`hover:bg-surface/50 transition-colors ${className}`}>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-16 rounded" />
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-16 rounded" />
      </td>
      <td className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-8 w-16 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </td>
    </tr>
  );
}
