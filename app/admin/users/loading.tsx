import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import TableRowSkeleton from '@/components/skeletons/TableRowSkeleton';

export default function AdminUsersLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="space-y-6 max-w-5xl"
    >
      <span className="sr-only">Loading user directory…</span>

      {/* Header & Search Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" aria-hidden="true">
        <div className="space-y-1.5">
          <Skeleton className="h-8 w-48 sm:w-64" />
          <Skeleton className="h-4 w-64 sm:w-96" />
        </div>
        <Skeleton className="w-full sm:w-64 h-[38px] rounded-md" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border border-border overflow-hidden" aria-hidden="true">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs font-semibold text-neutral-muted uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={4} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
