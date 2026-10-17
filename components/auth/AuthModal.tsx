'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { X, Eye, EyeOff, Check, CheckCircle2 } from 'lucide-react';

// Google "G" icon — inline SVG, no extra dependency
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, authModalOptions, closeAuthModal } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [signupSuccessEmail, setSignupSuccessEmail] = useState<string | null>(null);
  const [resetSuccessEmail, setResetSuccessEmail] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const pushedHistoryRef = useRef(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Store the element that triggered the modal to restore focus upon closing
  useEffect(() => {
    if (isAuthModalOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement | null;
      setTab(authModalTab);
      setEmail('');
      setPassword('');
      setFullName('');
      setShowPassword(false);
      setFieldErrors({});
      setGeneralError(null);
      setSignupSuccessEmail(null);
      setResetSuccessEmail(null);
      setGoogleLoading(false);
    } else {
      // Focus returns to the element that opened it
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    }
  }, [isAuthModalOpen, authModalTab]);

  // History pushState to allow browser Back gesture to close the modal
  useEffect(() => {
    if (!isAuthModalOpen) return;

    window.history.pushState({ unidealAuthModal: true }, '');
    pushedHistoryRef.current = true;

    const handlePopState = () => {
      pushedHistoryRef.current = false;
      closeAuthModal();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (pushedHistoryRef.current) {
        pushedHistoryRef.current = false;
        try {
          if (window.history.state?.unidealAuthModal) {
            window.history.back();
          }
        } catch {
          // ignore navigation errors
        }
      }
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isAuthModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Focus trap implementation
  useEffect(() => {
    if (!isAuthModalOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const currentFocusables = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!currentFocusables || currentFocusables.length === 0) return;

      const first = currentFocusables[0];
      const last = currentFocusables[currentFocusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isAuthModalOpen, tab, signupSuccessEmail, generalError]);

  // Validate fields client-side before sending to Supabase
  const validateForm = () => {
    const errors: { email?: string; password?: string; fullName?: string } = {};

    if (tab === 'signup') {
      if (!fullName.trim()) {
        errors.fullName = 'Full name is required';
      } else if (fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
      }
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (tab !== 'forgot_password') {
      if (!password) {
        errors.password = 'Password is required';
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    setFieldErrors(errors);
    return errors;
  };

  const handleAuthSuccess = useCallback(() => {
    closeAuthModal();
    if (authModalOptions.onSuccess) {
      authModalOptions.onSuccess();
    } else if (authModalOptions.returnTo) {
      router.push(authModalOptions.returnTo);
    }
  }, [authModalOptions, closeAuthModal, router]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGeneralError(null);
    const redirectTo = `${window.location.origin}/auth/callback${
      authModalOptions.returnTo ? `?next=${encodeURIComponent(authModalOptions.returnTo)}` : ''
    }`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      setGeneralError(error.message);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return; // Block double submits

    setGeneralError(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      // Focus first invalid field
      if (validationErrors.fullName) {
        nameInputRef.current?.focus();
      } else if (validationErrors.email) {
        emailInputRef.current?.focus();
      } else if (validationErrors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setLoading(true);

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          // Never show raw Supabase error text
          const friendlyMessage =
            error.message.toLowerCase().includes('invalid login credentials') ||
            error.message.toLowerCase().includes('invalid_grant')
              ? 'Invalid email or password. Please check your credentials and try again.'
              : error.message.toLowerCase().includes('email not confirmed')
              ? 'Please verify your email address before signing in.'
              : 'Could not sign in. Please check your details and try again.';

          setGeneralError(friendlyMessage);
          setTimeout(() => bannerRef.current?.focus(), 50);
        } else {
          handleAuthSuccess();
        }
      } else if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/verify-email`,
          },
        });

        if (error) {
          const friendlyMessage =
            error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already exists')
              ? 'An account with this email address already exists. Please sign in.'
              : error.message.toLowerCase().includes('rate limit')
              ? 'Too many attempts. Please try again in a few minutes.'
              : 'Could not create account. Please try again.';

          setGeneralError(friendlyMessage);
          setTimeout(() => bannerRef.current?.focus(), 50);
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
          // Email already registered in Supabase identities
          setGeneralError('An account with this email address already exists. Please sign in.');
          setTimeout(() => bannerRef.current?.focus(), 50);
        } else {
          setSignupSuccessEmail(email.trim());
        }
      } else if (tab === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
        });

        if (error) {
          const friendlyMessage = error.message.toLowerCase().includes('rate limit')
            ? 'Too many attempts. Please try again in a few minutes.'
            : 'Could not send reset link. Please check your email and try again.';

          setGeneralError(friendlyMessage);
          setTimeout(() => bannerRef.current?.focus(), 50);
        } else {
          setResetSuccessEmail(email.trim());
        }
      }
    } catch {
      setGeneralError('Could not connect. Please check your network and try again.');
      setTimeout(() => bannerRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (newTab: 'login' | 'signup' | 'forgot_password') => {
    setTab(newTab);
    setFieldErrors({});
    setGeneralError(null);
    setSignupSuccessEmail(null);
    setResetSuccessEmail(null);
  };

  if (!isAuthModalOpen) return null;

  // Derive headline context for the brand panel based on returnTo / context
  const returnToPath = (authModalOptions.returnTo || '').toLowerCase();
  const explicitContext = (authModalOptions.context || '').toLowerCase();

  let brandLead = 'Buy and sell on';
  let brandHighlight = 'campus.';

  if (
    explicitContext === 'contact' ||
    returnToPath.includes('/listing/') ||
    returnToPath.includes('contact')
  ) {
    brandLead = 'Sign in to contact';
    brandHighlight = 'the seller.';
  } else if (
    explicitContext === 'sell' ||
    returnToPath === '/sell' ||
    returnToPath.includes('/sell')
  ) {
    brandLead = 'Sign in to';
    brandHighlight = 'list your item.';
  } else if (
    explicitContext === 'dashboard' ||
    explicitContext === 'profile' ||
    returnToPath === '/dashboard' ||
    returnToPath === '/profile' ||
    returnToPath.includes('/dashboard') ||
    returnToPath.includes('/profile')
  ) {
    brandLead = 'Sign in to see';
    brandHighlight = 'your listings.';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 motion-reduce:transition-none transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeAuthModal();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-3xl bg-surface rounded-md border border-border shadow-sm overflow-hidden relative flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button: 44x44px tap target */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-3 right-3 z-20 w-11 h-11 flex items-center justify-center text-neutral-muted hover:text-neutral-text rounded-md focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* LEFT COLUMN: Form column (about 55%, full height, internally scrollable) */}
        <div className="w-full md:w-[55%] p-6 md:p-10 overflow-y-auto flex flex-col justify-between">
          {resetSuccessEmail ? (
            /* Password Reset Confirmation State */
            <div className="py-4 space-y-5 text-left font-body">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="auth-modal-title"
                  tabIndex={-1}
                  className="text-2xl font-bold text-neutral-text font-heading focus:outline-none"
                >
                  Check your inbox
                </h2>
                <p className="mt-2 text-sm text-neutral-muted leading-relaxed font-body">
                  We&apos;ve sent a password reset link to{' '}
                  <strong className="text-neutral-text font-semibold">{resetSuccessEmail}</strong>.
                  Please follow the link in that email to reset your password.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setResetSuccessEmail(null);
                    setTab('login');
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-primary text-white rounded-md font-medium text-base hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 motion-reduce:transition-none transition-colors"
                >
                  Back to Sign in
                </button>
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-surface text-neutral-text border border-border rounded-md font-medium text-base hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : signupSuccessEmail ? (
            /* Signup Verification Confirmation State */
            <div className="py-4 space-y-5 text-left font-body">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-primary" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="auth-modal-title"
                  tabIndex={-1}
                  className="text-2xl font-bold text-neutral-text font-heading focus:outline-none"
                >
                  Check your inbox
                </h2>
                <p className="mt-2 text-sm text-neutral-muted leading-relaxed font-body">
                  We&apos;ve sent a verification link to{' '}
                  <strong className="text-neutral-text font-semibold">{signupSuccessEmail}</strong>.
                  Please click the link in that email to confirm your account and begin using UniDeal.
                </p>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSignupSuccessEmail(null);
                    setTab('login');
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-primary text-white rounded-md font-medium text-base hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 motion-reduce:transition-none transition-colors"
                >
                  Back to Sign in
                </button>
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-surface text-neutral-text border border-border rounded-md font-medium text-base hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Tablist or Back Link */}
              {tab === 'forgot_password' ? (
                <div className="flex items-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => switchTab('login')}
                    className="text-sm font-medium text-neutral-muted hover:text-neutral-text flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent rounded px-1 py-0.5"
                  >
                    ← Back to Sign in
                  </button>
                </div>
              ) : (
                <div className="flex border-b border-border mb-6" role="tablist" aria-label="Authentication">
                  <button
                    type="button"
                    role="tab"
                    id="auth-tab-login"
                    aria-selected={tab === 'login'}
                    aria-controls="auth-panel"
                    onClick={() => switchTab('login')}
                    className={`pb-3 pr-4 text-base font-semibold border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-t min-h-[44px] flex items-center ${
                      tab === 'login'
                        ? 'border-accent text-neutral-text'
                        : 'border-transparent text-neutral-muted hover:text-neutral-text'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="auth-tab-signup"
                    aria-selected={tab === 'signup'}
                    aria-controls="auth-panel"
                    onClick={() => switchTab('signup')}
                    className={`pb-3 px-4 text-base font-semibold border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-t min-h-[44px] flex items-center ${
                      tab === 'signup'
                        ? 'border-accent text-neutral-text'
                        : 'border-transparent text-neutral-muted hover:text-neutral-text'
                    }`}
                  >
                    Create account
                  </button>
                </div>
              )}

              {/* Heading and one-line muted subtext */}
              <div className="mb-6">
                <h2 id="auth-modal-title" className="text-2xl font-bold text-neutral-text font-heading">
                  {tab === 'forgot_password'
                    ? 'Reset password'
                    : tab === 'signup'
                    ? 'Create an account'
                    : 'Welcome back'}
                </h2>
                <p className="mt-1 text-sm text-neutral-muted font-body">
                  {tab === 'forgot_password'
                    ? "Enter your email and we'll send you a link to reset your password."
                    : tab === 'signup'
                    ? 'Takes a minute. Free to use.'
                    : 'Sign in to pick up where you left off.'}
                </p>
              </div>

              {/* Auth failure banner */}
              {generalError && (
                <div
                  ref={bannerRef}
                  tabIndex={-1}
                  role="alert"
                  className="mb-5 p-3.5 border border-danger/30 rounded-md bg-danger/5 text-danger text-sm font-medium focus:outline-none focus:ring-2 focus:ring-danger"
                >
                  {generalError}
                </div>
              )}

              {/* Form */}
              <form id="auth-panel" onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Full name (Signup only) */}
                {tab === 'signup' && (
                  <div>
                    <label
                      htmlFor="auth-fullname"
                      className="block text-sm font-medium text-neutral-text mb-1.5 font-body"
                    >
                      Full name
                    </label>
                    <input
                      ref={nameInputRef}
                      id="auth-fullname"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) {
                          setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                        }
                      }}
                      placeholder="e.g. Akshit Sharma"
                      className={`w-full h-12 px-3.5 text-base rounded-md border bg-surface text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors ${
                        fieldErrors.fullName ? 'border-danger focus:ring-danger' : 'border-border'
                      }`}
                      aria-required="true"
                      aria-invalid={!!fieldErrors.fullName}
                      aria-describedby="auth-fullname-helper auth-fullname-error"
                    />
                    <p id="auth-fullname-helper" className="mt-1.5 text-xs text-neutral-muted font-body">
                      Only your first name is shown on listings.
                    </p>
                    {fieldErrors.fullName && (
                      <p id="auth-fullname-error" className="mt-1 text-sm text-danger font-medium font-body">
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>
                )}

                {/* Email address */}
                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-sm font-medium text-neutral-text mb-1.5 font-body"
                  >
                    Email
                  </label>
                  <input
                    ref={emailInputRef}
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="student@example.com"
                    className={`w-full h-12 px-3.5 text-base rounded-md border bg-surface text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors ${
                      fieldErrors.email ? 'border-danger focus:ring-danger' : 'border-border'
                    }`}
                    aria-required="true"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="auth-email-error" className="mt-1 text-sm text-danger font-medium font-body">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password field with show/hide toggle inside (login and signup only) */}
                {tab !== 'forgot_password' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="auth-password"
                        className="block text-sm font-medium text-neutral-text font-body"
                      >
                        Password
                      </label>
                      {tab === 'login' && (
                        <button
                          type="button"
                          id="forgot-password-link"
                          onClick={() => switchTab('forgot_password')}
                          className="text-xs text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-accent rounded"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        ref={passwordInputRef}
                        id="auth-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) {
                            setFieldErrors((prev) => ({ ...prev, password: undefined }));
                          }
                        }}
                        placeholder="••••••••"
                        className={`w-full h-12 pl-3.5 pr-12 text-base rounded-md border bg-surface text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors ${
                          fieldErrors.password ? 'border-danger focus:ring-danger' : 'border-border'
                        }`}
                        aria-required="true"
                        aria-invalid={!!fieldErrors.password}
                        aria-describedby="auth-password-helper auth-password-error"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-neutral-muted hover:text-neutral-text focus:outline-none focus:ring-2 focus:ring-accent rounded-r-md min-h-[44px]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <Eye className="w-5 h-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {tab === 'signup' && (
                      <p id="auth-password-helper" className="mt-1.5 text-xs text-neutral-muted font-body">
                        Password must be at least 6 characters
                      </p>
                    )}
                    {fieldErrors.password && (
                      <p id="auth-password-error" className="mt-1 text-sm text-danger font-medium font-body">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full min-h-[44px] py-2.5 px-4 bg-primary text-white rounded-md font-medium text-base hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 motion-reduce:transition-none transition-colors flex items-center justify-center"
                  >
                    {loading
                      ? tab === 'forgot_password'
                        ? 'Sending link...'
                        : tab === 'signup'
                        ? 'Creating account...'
                        : 'Signing in...'
                      : tab === 'forgot_password'
                      ? 'Send reset link'
                      : tab === 'signup'
                      ? 'Create account'
                      : 'Sign in'}
                  </button>
                </div>

                {/* Signup terms footnote (Signup only) */}
                {tab === 'signup' && (
                  <p className="text-xs text-neutral-muted leading-relaxed font-body pt-1">
                    By creating an account, you confirm you&apos;re 18 or older and agree to our{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-neutral-text focus:outline-none focus:ring-2 focus:ring-accent rounded"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-neutral-text focus:outline-none focus:ring-2 focus:ring-accent rounded"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                )}

                {/* Google Sign-in and Divider (login and signup only) */}
                {tab !== 'forgot_password' && (
                  <>
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-neutral-muted font-body">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <button
                      type="button"
                      id="google-signin-btn"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                      className="w-full py-2.5 px-4 bg-surface text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 motion-reduce:transition-none transition-colors min-h-[44px] flex items-center justify-center gap-2.5 shadow-xs"
                    >
                      {googleLoading ? (
                        <div className="w-4 h-4 border-2 border-neutral-muted/30 border-t-neutral-muted rounded-full animate-spin" />
                      ) : (
                        <GoogleIcon />
                      )}
                      <span>Continue with Google</span>
                    </button>
                  </>
                )}

                {/* Below-form tab-switch text link */}
                <div className="pt-3 text-center border-t border-border mt-4">
                  {tab === 'forgot_password' ? (
                    <p className="text-sm text-neutral-muted font-body">
                      Remember your password?{' '}
                      <button
                        type="button"
                        onClick={() => switchTab('login')}
                        className="text-neutral-text font-semibold hover:text-primary underline focus:outline-none focus:ring-2 focus:ring-accent rounded p-0.5"
                      >
                        Sign in
                      </button>
                    </p>
                  ) : tab === 'signup' ? (
                    <p className="text-sm text-neutral-muted font-body">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchTab('login')}
                        className="text-neutral-text font-semibold hover:text-primary underline focus:outline-none focus:ring-2 focus:ring-accent rounded p-0.5"
                      >
                        Sign in
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-neutral-muted font-body">
                      New to UniDeal?{' '}
                      <button
                        type="button"
                        onClick={() => switchTab('signup')}
                        className="text-neutral-text font-semibold hover:text-primary underline focus:outline-none focus:ring-2 focus:ring-accent rounded p-0.5"
                      >
                        Create an account
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Brand panel (about 45%, desktop md+ only) */}
        <div className="hidden md:flex md:w-[45%] bg-[#0F172A] text-white p-10 flex-col justify-between select-none">
          {/* Top Logo Mark */}
          <div>
            <div className="flex items-center gap-2 text-lg font-bold tracking-tight font-heading text-white">
              <span className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center font-display font-extrabold text-base">
                U
              </span>
              <span>UniDeal</span>
            </div>
          </div>

          {/* Center Content: Headline & 3 check lines */}
          <div className="my-auto py-6">
            <h3 className="text-2xl lg:text-3xl font-bold font-heading text-white leading-tight">
              {brandLead}{' '}
              <span className="text-primary">{brandHighlight}</span>
            </h3>

            <div className="mt-8 space-y-4 font-body">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                </span>
                <span className="text-sm text-white/90">Phone numbers are never shown</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                </span>
                <span className="text-sm text-white/90">Only your first name appears on listings</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                </span>
                <span className="text-sm text-white/90">Free to use</span>
              </div>
            </div>
          </div>

          {/* Bottom subtle note or spacer (keeps layout balanced) */}
          <div className="text-xs text-white/40 font-body">
            Campus marketplace
          </div>
        </div>
      </div>
    </div>
  );
}
