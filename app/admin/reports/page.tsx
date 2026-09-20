'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, Trash2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PendingReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  listings: {
    id: string;
    title: string;
    slug: string;
    price: number;
    status: string;
    images: string[];
  } | null;
  public_profiles: {
    id: string;
    full_name: string;
  } | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      const json = await res.json();
      if (res.ok && json.data?.reports) {
        setReports(json.data.reports);
      } else {
        setError(json.error?.message || 'Failed to fetch reports.');
      }
    } catch {
      setError('Network error loading reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (id: string, action: 'remove' | 'dismiss') => {
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || 'Failed to resolve report.');
      } else {
        await fetchReports();
      }
    } catch {
      setError('Network error during resolve action.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-muted flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading reports queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-text font-heading flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-primary" />
          <span>Reported Listings Queue</span>
        </h1>
        <p className="text-sm text-neutral-muted mt-1">
          Review community reports and choose to remove the reported listing or dismiss the report.
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

      {reports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-border space-y-3">
          <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
          <h3 className="text-base font-semibold text-neutral-text font-heading">
            No Pending Reports
          </h3>
          <p className="text-sm text-neutral-muted max-w-sm mx-auto">
            All reported listings have been reviewed and resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((item) => (
            <div key={item.id} className="p-5 bg-white rounded-lg border border-border space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-md bg-surface border border-border overflow-hidden shrink-0">
                    {item.listings?.images?.[0] ? (
                      <img src={item.listings.images[0]} alt={item.listings.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-muted">No Image</div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-muted">
                      <span className="font-semibold text-danger">Reported Reason: {item.reason}</span>
                      <span>•</span>
                      <span>Reporter: {item.public_profiles?.full_name || 'Student'}</span>
                    </div>

                    {item.listings && (
                      <Link
                        href={`/listing/${item.listings.slug}`}
                        className="text-base font-bold text-neutral-text hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <span>{item.listings.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-muted" />
                      </Link>
                    )}

                    <div className="text-xs text-neutral-muted">
                      Status: <span className="font-semibold uppercase">{item.listings?.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={actionId === item.id}
                    onClick={() => handleResolve(item.id, 'remove')}
                    className="px-3.5 py-2 bg-danger text-white text-xs font-semibold rounded hover:bg-danger/90 transition-colors min-h-[38px] flex items-center gap-1.5"
                  >
                    {actionId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>Remove Listing</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionId === item.id}
                    onClick={() => handleResolve(item.id, 'dismiss')}
                    className="px-3.5 py-2 bg-surface hover:bg-border text-neutral-text border border-border text-xs font-medium rounded transition-colors min-h-[38px] flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-neutral-muted" />
                    <span>Dismiss Report</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
