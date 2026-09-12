'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, AlertCircle, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import type { EmailOtpType } from '@supabase/supabase-js';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { user, refreshUser, openAuthModal } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  // Handle token or code from email link
  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const code = searchParams.get('code');

    async function handleVerification() {
      if (tokenHash && type) {
        setStatus('verifying');
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          setStatus('success');
          await refreshUser();
        }
      } else if (code) {
        setStatus('verifying');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          setStatus('success');
          await refreshUser();
        }
      } else if (user?.email_confirmed_at) {
        setStatus('success');
      } else {
        setStatus('idle');
      }
    }

    handleVerification();
  }, [searchParams, supabase, user, refreshUser]);

  // Handle cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendVerification = useCallback(async () => {
    if (!user?.email || resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        setResendMessage(`Could not resend email: ${error.message}`);
      } else {
        setResendMessage('Verification email sent! Please check your inbox.');
        setResendCooldown(60);
      }
    } catch {
      setResendMessage('An unexpected error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  }, [user, resendCooldown, resendLoading, supabase]);

  if (status === 'verifying') {
    return (
      <div className="p-8 rounded-lg bg-surface border border-border space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-text font-heading">
          Verifying your email...
        </h1>
        <p className="text-sm text-neutral-muted">
          Please wait while we confirm your verification link with UniDeal.
        </p>
      </div>
    );
  }

  if (status === 'success' || user?.email_confirmed_at) {
    return (
      <div className="p-8 rounded-lg bg-surface border border-border space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-text font-heading">
          Email Verified!
        </h1>
        <p className="text-sm text-neutral-muted leading-relaxed">
          Your email address has been verified. You now have full access to post listings, contact sellers on WhatsApp, and manage your account.
        </p>
        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/browse"
            className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            <span>Browse Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/sell"
            className="w-full py-2.5 px-4 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-colors min-h-[44px] flex items-center justify-center"
          >
            List an Item for Sale
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-8 rounded-lg bg-surface border border-border space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-text font-heading">
          Verification Link Expired
        </h1>
        <p className="text-sm text-neutral-muted leading-relaxed">
          {errorMessage || 'This email verification link is invalid or has already expired.'}
        </p>
        <div className="pt-4 flex flex-col gap-2">
          {user ? (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendCooldown > 0 || resendLoading}
              className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
            >
              {resendLoading
                ? 'Sending...'
                : resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : 'Send New Verification Link'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal({ tab: 'login' })}
              className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Sign In to Request New Link
            </button>
          )}
          <Link
            href="/browse"
            className="w-full py-2.5 px-4 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-colors min-h-[44px] flex items-center justify-center"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // Idle state: "Check your inbox"
  return (
    <div className="p-8 rounded-lg bg-surface border border-border space-y-4 max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
        <Mail className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-text font-heading">
        Check Your Email
      </h1>
      <p className="text-sm text-neutral-muted leading-relaxed">
        {user?.email ? (
          <>
            We&apos;ve sent a verification link to <strong className="text-neutral-text">{user.email}</strong>.
            Click the link in that email to confirm your account and start using UniDeal.
          </>
        ) : (
          'Please click the verification link sent to your email to confirm your account and start using UniDeal.'
        )}
      </p>

      {resendMessage && (
        <p className="text-xs text-primary font-medium">{resendMessage}</p>
      )}

      <div className="pt-4 border-t border-border flex flex-col gap-2">
        {user && (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendCooldown > 0 || resendLoading}
            className="w-full py-2.5 px-4 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary transition-colors min-h-[44px] flex items-center justify-center"
          >
            {resendLoading
              ? 'Sending...'
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend Verification Email'}
          </button>
        )}
        <Link
          href="/browse"
          className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
        >
          Continue Browsing as Guest
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Suspense fallback={
        <div className="p-8 rounded-lg bg-surface border border-border max-w-md mx-auto text-neutral-muted">
          Loading verification details...
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
