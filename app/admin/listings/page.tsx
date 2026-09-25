'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ListFilter, Search, AlertCircle, XCircle, Loader2, ExternalLink, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';

interface AdminListingItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: string;
  images: string[];
  status: string;
  rejection_reason?: string | null;
  created_at: string;
  categories: { name: string } | null;
  public_profiles: { full_name: string } | null;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Single reject inline state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [singleReason, setSingleReason] = useState('');

  // Bulk reject inline modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkReason, setBulkReason] = useState('');
  const [bulkConfirmText, setBulkConfirmText] = useState(false);

  // Status/Result Banners
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all') queryParams.set('status', statusFilter);
      if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/listings?${queryParams.toString()}`);
      const json = await res.json();
      if (res.ok && json.data?.listings) {
        setListings(json.data.listings);
      } else {
        setError(json.error?.message || 'Failed to load listings.');
      }
    } catch {
      setError('Network error fetching admin listings.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Select all checkbox handler
  const handleSelectAll = () => {
    if (selectedIds.length === listings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(listings.map((item) => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Single reject execution
  const handleSingleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !singleReason.trim()) return;

    setActionLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      const res = await fetch(`/api/admin/listings/${rejectingId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: singleReason.trim() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message || 'Rejection failed.');
      } else {
        setResultMessage(`Listing rejected successfully.`);
        setRejectingId(null);
        setSingleReason('');
        await fetchListings();
      }
    } catch {
      setError('Network error during rejection.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk reject execution
  const handleBulkRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !bulkReason.trim()) return;

    setActionLoading(true);
    setError(null);
    setResultMessage(null);

    try {
      const res = await fetch('/api/admin/listings/bulk-reject', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_ids: selectedIds,
          reason: bulkReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || 'Bulk rejection failed.');
      } else {
        const { rejected, skipped } = json.data || { rejected: [], skipped: [] };
        const skippedInfo = skipped.length > 0 ? ` (${skipped.length} skipped)` : '';
        setResultMessage(`Bulk action complete: ${rejected.length} listings rejected${skippedInfo}.`);
        setShowBulkModal(false);
        setBulkReason('');
        setBulkConfirmText(false);
        setSelectedIds([]);
        await fetchListings();
      }
    } catch {
      setError('Network error during bulk rejection.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      case 'sold':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Sold</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text font-heading flex items-center gap-2">
            <ListFilter className="w-6 h-6 text-primary" />
            <span>Listings Management</span>
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            View all campus marketplace listings, perform single listing rejection, or bulk reject selected items.
          </p>
        </div>

        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setShowBulkModal(true);
              setBulkReason('');
              setBulkConfirmText(false);
            }}
            className="px-4 py-2 bg-danger hover:bg-danger/90 text-white text-xs font-bold rounded transition-colors flex items-center gap-2 shadow-sm min-h-[38px]"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Selected ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Result / Error Messages */}
      {resultMessage && (
        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{resultMessage}</span>
          <button type="button" onClick={() => setResultMessage(null)} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search listing titles..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded border border-border text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label htmlFor="status-filter" className="text-xs font-medium text-neutral-muted whitespace-nowrap">
            Filter Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded border border-border bg-white text-neutral-text focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px]"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Bulk Reject Modal Overlay */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]">
          <div className="w-full max-w-md bg-white rounded-lg p-6 space-y-4 border border-border shadow-lg">
            <div className="flex items-center gap-2 text-danger">
              <XCircle className="w-5 h-5" />
              <h3 className="text-lg font-bold font-heading">Reject {selectedIds.length} Listings?</h3>
            </div>

            <p className="text-xs text-neutral-muted leading-relaxed">
              This action will mark all {selectedIds.length} selected listings as <strong>rejected</strong>. Already sold or already rejected listings will be safely skipped.
            </p>

            <form onSubmit={handleBulkRejectSubmit} className="space-y-4">
              <div>
                <label htmlFor="bulk-reason-input" className="block text-xs font-semibold text-neutral-text mb-1">
                  Rejection Reason (Applied to all selected items):
                </label>
                <textarea
                  id="bulk-reason-input"
                  required
                  rows={3}
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="e.g. Bulk moderation review: Prohibited items / Inappropriate content"
                  className="w-full p-2.5 text-xs rounded border border-border text-neutral-text focus:outline-none focus:ring-1 focus:ring-danger"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="confirm-bulk-check"
                  checked={bulkConfirmText}
                  onChange={(e) => setBulkConfirmText(e.target.checked)}
                  className="w-4 h-4 rounded text-danger focus:ring-danger"
                />
                <label htmlFor="confirm-bulk-check" className="text-xs font-medium text-neutral-text">
                  Confirm rejection of {selectedIds.length} selected listings
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-muted hover:text-neutral-text min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !bulkReason.trim() || !bulkConfirmText}
                  className="px-4 py-2 bg-danger text-white text-xs font-bold rounded hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[38px]"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirm Bulk Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Reject Modal Overlay */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]">
          <div className="w-full max-w-md bg-white rounded-lg p-6 space-y-4 border border-border shadow-lg">
            <div className="flex items-center gap-2 text-danger">
              <XCircle className="w-5 h-5" />
              <h3 className="text-lg font-bold font-heading">Reject Listing</h3>
            </div>

            <p className="text-xs text-neutral-muted">
              Specify the reason for rejecting this listing. The reason will be stored and displayed to the seller on their Dashboard.
            </p>

            <form onSubmit={handleSingleReject} className="space-y-4">
              <div>
                <label htmlFor="single-reason-input" className="block text-xs font-semibold text-neutral-text mb-1">
                  Rejection Reason:
                </label>
                <input
                  id="single-reason-input"
                  type="text"
                  required
                  value={singleReason}
                  onChange={(e) => setSingleReason(e.target.value)}
                  placeholder="e.g. Invalid contact info / Prohibited item"
                  className="w-full px-3 py-2 text-xs rounded border border-border text-neutral-text focus:outline-none focus:ring-1 focus:ring-danger min-h-[38px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-muted hover:text-neutral-text min-h-[38px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !singleReason.trim()}
                  className="px-4 py-2 bg-danger text-white text-xs font-bold rounded hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[38px]"
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Listings Table */}
      {loading ? (
        <div className="p-12 text-center text-neutral-muted flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Loading admin listings...</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-border text-neutral-muted">
          No listings found matching the selected filters.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-neutral-muted font-semibold uppercase">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button type="button" onClick={handleSelectAll} className="focus:outline-none">
                    {selectedIds.length === listings.length && listings.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-muted" />
                    )}
                  </button>
                </th>
                <th className="p-3">Listing Title</th>
                <th className="p-3">Seller</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr key={item.id} className={isSelected ? 'bg-primary/[0.03]' : 'hover:bg-surface/50'}>
                    <td className="p-3 text-center">
                      <button type="button" onClick={() => toggleSelect(item.id)} className="focus:outline-none">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-muted" />
                        )}
                      </button>
                    </td>

                    <td className="p-3">
                      <Link
                        href={`/listing/${item.slug}`}
                        className="font-bold text-neutral-text hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-muted" />
                      </Link>
                      {item.rejection_reason && (
                        <p className="text-[10px] text-danger mt-0.5">
                          <strong>Reason:</strong> {item.rejection_reason}
                        </p>
                      )}
                    </td>

                    <td className="p-3 text-neutral-muted font-medium">
                      {item.public_profiles?.full_name || 'Student'}
                    </td>

                    <td className="p-3 text-neutral-muted">
                      {item.categories?.name || 'Uncategorized'}
                    </td>

                    <td className="p-3 font-semibold text-neutral-text font-heading">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="p-3 text-neutral-muted">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-right">
                      {item.status !== 'sold' && item.status !== 'rejected' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingId(item.id);
                            setSingleReason('');
                          }}
                          className="px-2.5 py-1 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 text-[11px] font-semibold rounded transition-colors"
                        >
                          Reject
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-muted font-mono">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
