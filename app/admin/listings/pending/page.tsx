'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PendingListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: string;
  images: string[];
  status: string;
  created_at: string;
  categories: { name: string } | null;
  public_profiles: { full_name: string } | null;
}

export default function AdminPendingQueuePage() {
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/listings/pending');
      const json = await res.json();
      if (res.ok && json.data?.listings) {
        setListings(json.data.listings);
      } else {
        setError(json.error?.message || 'Failed to fetch pending queue.');
      }
    } catch {
      setError('Network error loading pending listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/listings/${id}/approve`, { method: 'PATCH' });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || 'Approval failed.');
      } else {
        await fetchPending();
      }
    } catch {
      setError('Network error during approval.');
    } finally {
      setActionId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !rejectionReason.trim()) return;

    setActionId(rejectingId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/listings/${rejectingId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || 'Rejection failed.');
      } else {
        setRejectingId(null);
        setRejectionReason('');
        await fetchPending();
      }
    } catch {
      setError('Network error during rejection.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-muted flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading pending queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-text font-heading flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          <span>Manual Review Queue</span>
        </h1>
        <p className="text-sm text-neutral-muted mt-1">
          Review and approve or reject listings created while manual moderation mode is active.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-border space-y-3">
          <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
          <h3 className="text-base font-semibold text-neutral-text font-heading">
            Pending Queue is Clear
          </h3>
          <p className="text-sm text-neutral-muted max-w-sm mx-auto">
            There are no listings currently awaiting manual review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((item) => (
            <div key={item.id} className="p-5 bg-white rounded-lg border border-border space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-md bg-surface border border-border overflow-hidden shrink-0">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-muted">No image</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-muted">
                      <span className="font-semibold uppercase text-primary">{item.categories?.name}</span>
                      <span>•</span>
                      <span>Seller: {item.public_profiles?.full_name || 'Student'}</span>
                    </div>

                    <Link
                      href={`/listing/${item.slug}`}
                      className="text-base font-bold text-neutral-text hover:text-primary transition-colors inline-flex items-center gap-1"
                    >
                      <span>{item.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-muted" />
                    </Link>

                    <div className="text-sm font-semibold text-neutral-text font-heading">
                      ₹{item.price.toLocaleString('en-IN')} {item.negotiable && '(Negotiable)'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={actionId === item.id}
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded transition-colors min-h-[38px] flex items-center gap-1.5"
                  >
                    {actionId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionId === item.id}
                    onClick={() => {
                      setRejectingId(item.id);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 text-xs font-semibold rounded transition-colors min-h-[38px] flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded bg-surface border border-border text-xs text-neutral-text leading-relaxed">
                <strong>Description:</strong> {item.description}
              </div>

              {/* Rejection Input Form Modal inline */}
              {rejectingId === item.id && (
                <form onSubmit={handleRejectSubmit} className="p-4 rounded-lg bg-danger/5 border border-danger/20 space-y-3">
                  <label htmlFor={`reject-reason-${item.id}`} className="block text-xs font-semibold text-danger">
                    Specify Rejection Reason (Visible to Seller on Dashboard):
                  </label>
                  <input
                    id={`reject-reason-${item.id}`}
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Prohibited item category / Invalid contact information"
                    className="w-full px-3 py-2 text-xs rounded border border-border bg-white text-neutral-text focus:outline-none focus:ring-1 focus:ring-danger min-h-[38px]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectingId(null)}
                      className="px-3 py-1.5 text-xs text-neutral-muted hover:text-neutral-text"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionId === item.id || !rejectionReason.trim()}
                      className="px-4 py-1.5 bg-danger text-white text-xs font-semibold rounded hover:bg-danger/90 min-h-[36px]"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
