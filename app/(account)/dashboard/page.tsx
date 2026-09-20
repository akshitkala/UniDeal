'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  Tag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Edit,
  Trash2,
  PlusCircle,
  Lock,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { ListingStatus, ListingCondition } from '@/types/domain';

interface SellerListing {
  id: string;
  slug: string;
  title: string;
  price: number;
  negotiable: boolean;
  condition: ListingCondition;
  images: string[];
  status: ListingStatus;
  rejection_reason?: string | null;
  created_at: string;
  sold_at?: string | null;
  categories?: { name: string } | null;
}

type TabType = 'active' | 'pending' | 'sold' | 'rejected';

export default function DashboardPage() {
  const { user, isLoading: authLoading, openAuthModal } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionListingId, setActionListingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchUserListings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          slug,
          title,
          price,
          negotiable,
          condition,
          images,
          status,
          rejection_reason,
          created_at,
          sold_at,
          categories(name)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setListings(data as unknown as SellerListing[]);
      } else {
        setListings([]);
      }
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchUserListings();
    } else {
      setLoading(false);
    }
  }, [user, fetchUserListings]);

  const handleMarkSold = async (id: string) => {
    setActionListingId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/listings/${id}/sold`, { method: 'POST' });
      if (!res.ok) {
        const json = await res.json();
        setActionError(json.error?.message || 'Could not mark listing as sold.');
        return;
      }
      await fetchUserListings();
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionListingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    setActionListingId(id);
    setActionError(null);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        setActionError(json.error?.message || 'Could not delete listing.');
        return;
      }
      await fetchUserListings();
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionListingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-neutral-muted flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="p-8 rounded-lg bg-surface border border-border space-y-4">
          <Lock className="w-8 h-8 text-neutral-muted mx-auto" />
          <h1 className="text-xl font-bold text-neutral-text font-heading">Sign In Required</h1>
          <p className="text-sm text-neutral-muted">You must sign in to view your dashboard.</p>

          <button
            type="button"
            onClick={() => openAuthModal({ tab: 'login', returnTo: '/dashboard' })}
            className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover min-h-[44px]"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    );
  }

  const activeListings = listings.filter((l) => l.status === 'approved');
  const pendingListings = listings.filter((l) => l.status === 'pending');
  const soldListings = listings.filter((l) => l.status === 'sold');
  const rejectedListings = listings.filter((l) => l.status === 'rejected');

  const tabCounts = {
    active: activeListings.length,
    pending: pendingListings.length,
    sold: soldListings.length,
    rejected: rejectedListings.length,
  };

  const currentTabListings =
    activeTab === 'active'
      ? activeListings
      : activeTab === 'pending'
      ? pendingListings
      : activeTab === 'sold'
      ? soldListings
      : rejectedListings;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
            Seller Dashboard
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Manage your items for sale on campus.
          </p>
        </div>

        <Link
          href="/sell"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors min-h-[44px] shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Item</span>
        </Link>
      </div>

      {actionError && (
        <div className="mb-6 p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-xs font-bold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Status Tabs — design.md §7.7 */}
      <div className="flex border-b border-border mb-6 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-muted hover:text-neutral-text'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Active ({tabCounts.active})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-muted hover:text-neutral-text'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Under Review ({tabCounts.pending})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sold')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sold'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-muted hover:text-neutral-text'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Sold ({tabCounts.sold})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'rejected'
              ? 'border-primary text-primary'
              : 'border-transparent text-neutral-muted hover:text-neutral-text'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Rejected ({tabCounts.rejected})</span>
        </button>
      </div>

      {/* Listing Cards List */}
      {currentTabListings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-border space-y-3">
          <AlertTriangle className="w-8 h-8 text-neutral-muted mx-auto" />
          <h3 className="text-base font-semibold text-neutral-text font-heading">
            {activeTab === 'active' && 'No active listings'}
            {activeTab === 'pending' && 'No items under review'}
            {activeTab === 'sold' && 'No items marked as sold'}
            {activeTab === 'rejected' && 'No rejected items'}
          </h3>
          <p className="text-sm text-neutral-muted max-w-sm mx-auto">
            {activeTab === 'active' && 'Post an item to connect with buyers on campus.'}
            {activeTab === 'pending' && 'When manual moderation is enabled, items awaiting approval appear here.'}
            {activeTab === 'sold' && 'Items you mark as sold will be stored here.'}
            {activeTab === 'rejected' && 'If an item is rejected by admin moderation, it will be listed here with a reason.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentTabListings.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 bg-white rounded-lg border border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
            >
              {/* Thumbnail & Meta */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-md bg-surface border border-border overflow-hidden shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-muted">No Image</div>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-primary">
                      {item.categories?.name || 'Item'}
                    </span>
                    <span className="text-xs text-neutral-muted">• {item.condition}</span>
                  </div>

                  <Link
                    href={`/listing/${item.slug}`}
                    className="text-base font-bold text-neutral-text hover:text-primary transition-colors flex items-center gap-1 leading-snug line-clamp-1"
                  >
                    <span>{item.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-muted shrink-0" />
                  </Link>

                  <div className="text-sm font-semibold text-neutral-text font-heading">
                    ₹{item.price.toLocaleString('en-IN')}
                    {item.negotiable && <span className="text-xs font-normal text-neutral-muted ml-1.5">(Negotiable)</span>}
                  </div>

                  {/* Rejection Reason display */}
                  {item.status === 'rejected' && item.rejection_reason && (
                    <div className="mt-2 p-2.5 rounded bg-danger/10 border border-danger/20 text-xs text-danger font-medium">
                      <strong>Rejection Reason:</strong> {item.rejection_reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 justify-end">
                {item.status === 'approved' && (
                  <button
                    type="button"
                    disabled={actionListingId === item.id}
                    onClick={() => handleMarkSold(item.id)}
                    className="px-3 py-1.5 bg-contact hover:bg-contact-hover text-white text-xs font-semibold rounded transition-colors min-h-[36px] flex items-center gap-1.5"
                  >
                    {actionListingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Mark Sold</span>
                  </button>
                )}

                {item.status !== 'sold' && (
                  <Link
                    href={`/listing/${item.slug}/edit`}
                    className="px-3 py-1.5 bg-surface hover:bg-border text-neutral-text border border-border text-xs font-medium rounded transition-colors min-h-[36px] flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5 text-neutral-muted" />
                    <span>Edit</span>
                  </Link>
                )}

                <button
                  type="button"
                  disabled={actionListingId === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 text-xs font-medium rounded transition-colors min-h-[36px] flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
