'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Loader2, AlertCircle, MailCheck } from 'lucide-react';
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
 * ContactSellerButton — covers all states from appflow.md §4:
 *  - logged-out: opens AuthModal
 *  - unverified: prompts to verify email
 *  - loading: spinner while API call in flight
 *  - rate-limited: shows daily-limit message
 *  - success: opens wa.me link in new tab
 *  - no contact: seller has no number set
 *  - error: generic fallback message
 */
export default function ContactSellerButton({ listingId, listingTitle, sellerId }: ContactSellerButtonProps) {
  const { user, isVerified, openAuthModal } = useAuth();
  const [state, setState] = useState<ContactState>({ kind: 'idle' });

  // Suppress unused var warning — sellerId is available if needed for future self-contact prevention
  void sellerId;

  // State: not logged in
  if (!user) {
    return (
      <button
        type="button"
        id="contact-seller-login"
        onClick={() => openAuthModal({ tab: 'login', returnTo: typeof window !== 'undefined' ? window.location.pathname : '/' })}
        className="w-full py-3.5 px-4 bg-contact hover:bg-contact-hover text-white rounded-md font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-contact focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Sign in to Contact Seller</span>
      </button>
    );
  }

  // State: logged in but unverified
  if (!isVerified) {
    return (
      <div className="space-y-2">
        <div className="w-full py-3 px-4 bg-surface border border-border rounded-md text-sm text-neutral-muted flex items-center gap-2 min-h-[44px]">
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
      return (
        <div className="w-full py-3 px-4 bg-surface border border-border rounded-md text-sm text-neutral-muted flex items-start gap-2 min-h-[44px]">
          <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span>You&apos;ve reached your daily contact limit. Try again tomorrow.</span>
        </div>
      );
    }
    if (state.code === 'NO_CONTACT') {
      return (
        <div className="w-full py-3 px-4 bg-surface border border-border rounded-md text-sm text-neutral-muted flex items-center gap-2 min-h-[44px]">
          <AlertCircle className="w-4 h-4 text-neutral-muted shrink-0" />
          <span>Seller contact not available.</span>
        </div>
      );
    }
    // Generic error — allow retry
    return (
      <div className="space-y-2">
        <div className="w-full py-3 px-4 bg-danger/5 border border-danger/20 rounded-md text-sm text-danger flex items-center gap-2 min-h-[44px]">
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
    return (
      <button
        type="button"
        disabled
        className="w-full py-3.5 px-4 bg-contact/80 text-white rounded-md font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 cursor-not-allowed"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Connecting...</span>
      </button>
    );
  }

  // State: success (already opened, button resets to idle)
  if (state.kind === 'success') {
    return (
      <button
        type="button"
        onClick={() => setState({ kind: 'idle' })}
        className="w-full py-3.5 px-4 bg-primary text-white rounded-md font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
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

  return (
    <button
      type="button"
      id="contact-seller-btn"
      onClick={handleContactClick}
      className="w-full py-3.5 px-4 bg-contact hover:bg-contact-hover text-white rounded-md font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-contact focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
    >
      <MessageCircle className="w-5 h-5" />
      <span>Contact Seller on WhatsApp</span>
    </button>
  );
}