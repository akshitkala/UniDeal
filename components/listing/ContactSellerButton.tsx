'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, MailCheck } from 'lucide-react';
import Link from 'next/link';

interface ContactSellerButtonProps {
  listingId: string;
  listingTitle: string;
  sellerId: string;
}

type ContactState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success' }
  | { kind: 'error'; message: string; code: string };

/**
 * Generic chat/WhatsApp-style icon (speech bubble with call prompt)
 * Distinguishes Contact Seller without using Meta's proprietary trademark.
 */
function GenericChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'w-5 h-5'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21l1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a4 4 0 0 0 4 4h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </svg>
  );
}

/**
 * ContactSellerButton — covers all states from appflow.md §4:
 *  - logged-out: opens AuthModal with returnTo
 *  - unverified: prompts to verify email
 *  - loading: spinner while API call in flight
 *  - rate-limited: shows daily-limit message
 *  - success: opens wa.me link in new tab
 *  - no contact: seller has no number set
 *  - error: generic fallback message
 * 
 * Distinguished by generic chat icon, label "Contact seller on WhatsApp",
 * taller height (50px), full width, and sticky bottom position on mobile.
 */
export default function ContactSellerButton({ listingId, listingTitle, sellerId }: ContactSellerButtonProps) {
  const { user, isVerified, openAuthModal } = useAuth();
  const [state, setState] = useState<ContactState>({ kind: 'idle' });

  // Suppress unused var warning — sellerId is available if needed
  void sellerId;
  void listingTitle;

  // Outer wrapper: Sticky on mobile (with safe-area inset), static on desktop
  const wrapSticky = (content: React.ReactNode) => (
    <div className="fixed md:static bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-border md:border-t-0 md:p-0 md:bg-transparent z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg md:shadow-none">
      <div className="max-w-md mx-auto md:max-w-none">{content}</div>
    </div>
  );

  // State: not logged in
  if (!user) {
    return wrapSticky(
      <button
        type="button"
        id="contact-seller-login"
        onClick={() => openAuthModal({ tab: 'login', returnTo: typeof window !== 'undefined' ? window.location.pathname : '/' })}
        className="w-full min-h-[50px] py-3.5 px-4 bg-contact hover:bg-contact-hover text-white rounded-md font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-contact focus:ring-offset-2 transition-colors flex items-center justify-center gap-2.5 shadow-sm"
      >
        <GenericChatIcon className="w-5 h-5 shrink-0" />
        <span>Contact seller on WhatsApp</span>
      </button>
    );
  }

  // State: logged in but unverified
  if (!isVerified) {
    return wrapSticky(
      <div className="space-y-2">
        <div className="w-full py-2.5 px-3 bg-surface border border-border rounded-md text-xs sm:text-sm text-neutral-muted flex items-center gap-2 min-h-[44px]">
          <MailCheck className="w-4 h-4 text-accent shrink-0" />
          <span>Verify your email to contact sellers.</span>
        </div>
        <Link
          href="/verify-email"
          className="block w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm text-center hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
        >
          Go to Verification Page
        </Link>
      </div>
    );
  }

  // State: rate-limited or no-contact or generic error
  if (state.kind === 'error') {
    if (state.code === 'RATE_LIMITED') {
      return wrapSticky(
        <div className="w-full py-3 px-4 bg-surface border border-border rounded-md text-sm text-neutral-muted flex items-start gap-2 min-h-[50px]">
          <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>You&apos;ve reached your daily contact limit. Try again tomorrow.</span>
        </div>
      );
    }
    if (state.code === 'NO_CONTACT') {
      return wrapSticky(
        <div className="w-full py-3 px-4 bg-surface border border-border rounded-md text-sm text-neutral-muted flex items-center gap-2 min-h-[50px]">
          <AlertCircle className="w-4 h-4 text-neutral-muted shrink-0" />
          <span>Seller contact not available.</span>
        </div>
      );
    }
    // Generic error — allow retry
    return wrapSticky(
      <div className="space-y-2">
        <div className="w-full py-2.5 px-3 bg-danger/5 border border-danger/20 rounded-md text-xs sm:text-sm text-danger flex items-center gap-2 min-h-[44px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.message}</span>
        </div>
        <button
          type="button"
          onClick={() => setState({ kind: 'idle' })}
          className="w-full py-2.5 px-4 bg-surface text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-border transition-colors min-h-[44px]"
        >
          Try again
        </button>
      </div>
    );
  }

  // State: loading
  if (state.kind === 'loading') {
    return wrapSticky(
      <button
        type="button"
        disabled
        className="w-full min-h-[50px] py-3.5 px-4 bg-contact/80 text-white rounded-md font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-not-allowed"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  // State: success (already opened, button resets to idle)
  if (state.kind === 'success') {
    return wrapSticky(
      <button
        type="button"
        onClick={() => setState({ kind: 'idle' })}
        className="w-full min-h-[50px] py-3.5 px-4 bg-contact text-white rounded-md font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 hover:bg-contact-hover transition-colors shadow-sm"
      >
        <GenericChatIcon className="w-5 h-5 shrink-0" />
        <span>WhatsApp Opened — Contact Again</span>
      </button>
    );
  }

  // State: idle — main CTA
  async function handleContactClick() {
    setState({ kind: 'loading' });
    try {
      const res = await fetch(`/api/listings/${listingId}/contact`, { method: 'POST' });
      const json = await res.json();

      if (!res.ok) {
        setState({ kind: 'error', message: json?.error?.message ?? 'Something went wrong.', code: json?.error?.code ?? 'UNKNOWN' });
        return;
      }

      const waLink: string = json?.data?.waLink;
      if (waLink) {
        window.open(waLink, '_blank', 'noopener,noreferrer');
        setState({ kind: 'success' });
      } else {
        setState({ kind: 'error', message: 'Could not generate contact link.', code: 'UNKNOWN' });
      }
    } catch {
      setState({ kind: 'error', message: 'Network error. Please try again.', code: 'NETWORK' });
    }
  }

  return wrapSticky(
    <button
      type="button"
      id="contact-seller-btn"
      onClick={handleContactClick}
      className="w-full min-h-[50px] py-3.5 px-4 bg-contact hover:bg-contact-hover text-white rounded-md font-semibold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-contact focus:ring-offset-2 transition-colors flex items-center justify-center gap-2.5 shadow-sm"
    >
      <GenericChatIcon className="w-5 h-5 shrink-0" />
      <span>Contact seller on WhatsApp</span>
    </button>
  );
}