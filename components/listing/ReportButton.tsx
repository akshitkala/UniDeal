'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Flag, X, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface ReportButtonProps {
  listingId: string;
  sellerId: string;
}

const REPORT_REASONS = [
  'Fake listing',
  'Prohibited item',
  'Misleading price',
  'Spam',
  'Other',
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

export default function ReportButton({ listingId, sellerId }: ReportButtonProps) {
  const { user, isVerified, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'duplicate' | 'error'; message: string } | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const pushedHistoryRef = useRef(false);


  const handleOpen = () => {
    if (!user) {
      openAuthModal({
        tab: 'login',
        returnTo: typeof window !== 'undefined' ? window.location.pathname : '/',
        context: 'report',
      });
      return;
    }

    triggerRef.current = document.activeElement as HTMLButtonElement | null;
    setReason('');
    setFeedback(null);
    setIsOpen(true);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFeedback(null);
    setReason('');

    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      if (window.history.state?.reportModal) {
        window.history.back();
      }
    }

    if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
    }
  }, []);

  // History state for browser back button dismissal
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ reportModal: true }, '');
    pushedHistoryRef.current = true;

    const handlePopState = () => {
      pushedHistoryRef.current = false;
      setIsOpen(false);
      setFeedback(null);
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen]);

  // Escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl?.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Autofocus first interactive element in modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const select = modalRef.current.querySelector<HTMLSelectElement>('select#report-reason');
      if (select) {
        select.focus();
      } else {
        const closeBtn = modalRef.current.querySelector<HTMLButtonElement>('button[aria-label="Close"]');
        closeBtn?.focus();
      }
    }
  }, [isOpen, feedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (res.status === 201) {
        setFeedback({
          type: 'success',
          message: "Thanks, we'll review this.",
        });
      } else if (res.status === 409) {
        setFeedback({
          type: 'duplicate',
          message: "You've already reported this listing.",
        });
      } else {
        const data = await res.json().catch(() => null);
        setFeedback({
          type: 'error',
          message: data?.error?.message || 'Could not submit your report. Please try again.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Could not submit your report. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Hidden on viewer's own listing
  if (user && user.id === sellerId) {
    return null;
  }

  return (
    <>
      {/* Low-emphasis trigger button below the fold */}
      <button
        ref={triggerRef}
        type="button"
        id="report-listing-button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-muted hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger/30 rounded py-1 px-2 transition-colors min-h-[36px]"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Report listing</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md bg-white rounded-xl shadow-xl border border-border p-6 relative animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 text-neutral-muted hover:text-neutral-text rounded-md hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h2 id="report-modal-title" className="text-lg font-bold text-neutral-text font-heading">
                Report this listing
              </h2>
            </div>

            {/* Logged in but unverified state */}
            {user && !isVerified ? (
              <div className="space-y-4 py-2">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-amber-900 text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Verify your email to report</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Only verified campus members can submit reports to prevent abuse.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-neutral-muted hover:text-neutral-text rounded-md min-h-[40px]"
                  >
                    Close
                  </button>
                  <Link
                    href="/verify-email"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-hover rounded-md transition-colors min-h-[40px] flex items-center"
                  >
                    Verify Email
                  </Link>
                </div>
              </div>
            ) : feedback ? (
              /* Success / Duplicate / Error Feedback View */
              <div className="space-y-4 py-2">
                {feedback.type === 'success' && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-3 text-neutral-text">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm font-medium">{feedback.message}</p>
                  </div>
                )}

                {feedback.type === 'duplicate' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm font-medium">{feedback.message}</p>
                  </div>
                )}

                {feedback.type === 'error' && (
                  <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3 text-danger">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0" />
                    <p className="text-sm font-medium">{feedback.message}</p>
                  </div>
                )}

                <p className="text-xs text-neutral-muted">
                  Reports are reviewed by platform moderators. The listing remains active while under review.
                </p>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    id="close-report-modal"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium bg-surface text-neutral-text border border-border hover:bg-surface/80 rounded-md transition-colors min-h-[40px]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Report Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-neutral-muted">
                  Help us keep the campus marketplace clean and trustworthy. Every report is reviewed by a moderator.
                </p>

                <div>
                  <label htmlFor="report-reason" className="block text-xs font-semibold text-neutral-text mb-1.5">
                    Reason for report <span className="text-danger">*</span>
                  </label>
                  <select
                    id="report-reason"
                    name="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-border rounded-md text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                  >
                    <option value="" disabled>
                      Select a reason...
                    </option>
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-neutral-muted hover:text-neutral-text rounded-md transition-colors min-h-[40px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-report-button"
                    disabled={loading || !reason}
                    className="px-4 py-2 text-sm font-semibold bg-danger text-white hover:bg-danger/90 disabled:opacity-60 disabled:cursor-not-allowed rounded-md transition-colors min-h-[40px] flex items-center gap-1.5"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
