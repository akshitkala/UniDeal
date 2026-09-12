'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, authModalOptions, closeAuthModal } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [signupSuccessEmail, setSignupSuccessEmail] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const pushedHistoryRef = useRef(false);

  // Sync initial tab when modal opens
  useEffect(() => {
    if (isAuthModalOpen) {
      setTab(authModalTab);
      setEmail('');
      setPassword('');
      setFullName('');
      setFieldErrors({});
      setGeneralError(null);
      setSignupSuccessEmail(null);
    }
  }, [isAuthModalOpen, authModalTab]);

  // History pushState to allow browser Back gesture to close the modal
  useEffect(() => {
    if (!isAuthModalOpen) return;

    // Push a state into history so the back button closes the modal
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
        // If closed via UI rather than popstate, unwind the state cleanly
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
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Initial focus
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isAuthModalOpen, tab, signupSuccessEmail]);

  // Validate fields client-side before sending to Supabase
  const validateForm = () => {
    const errors: { email?: string; password?: string; fullName?: string } = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (tab === 'signup') {
      if (!fullName.trim()) {
        errors.fullName = 'Full name is required';
      } else if (fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuthSuccess = useCallback(() => {
    closeAuthModal();
    if (authModalOptions.onSuccess) {
      authModalOptions.onSuccess();
    } else if (authModalOptions.returnTo) {
      router.push(authModalOptions.returnTo);
    }
  }, [authModalOptions, closeAuthModal, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setGeneralError(error.message);
        } else {
          handleAuthSuccess();
        }
      } else {
        // Sign up with full_name in user_metadata so the handle_new_user trigger sets it
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
          setGeneralError(error.message);
        } else if (data.user && data.user.identities && data.user.identities.length === 0) {
          // Email already registered
          setGeneralError('An account with this email address already exists. Please sign in.');
        } else {
          setSignupSuccessEmail(email.trim());
        }
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-200"
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
        className="w-full max-w-md bg-white rounded-lg shadow-md border border-border overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-neutral-muted hover:text-neutral-text rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {signupSuccessEmail ? (
          /* Signup Verification Pending State */
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 id="auth-modal-title" className="text-2xl font-bold text-neutral-text font-heading">
              Check your inbox
            </h2>
            <p className="text-sm text-neutral-muted leading-relaxed">
              We&apos;ve sent a verification email to{' '}
              <strong className="text-neutral-text">{signupSuccessEmail}</strong>.
              Please click the link in that email to confirm your account and begin using UniDeal.
            </p>
            <div className="pt-4 border-t border-border flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setSignupSuccessEmail(null);
                  setTab('login');
                }}
                className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center"
              >
                Back to Sign In
              </button>
              <button
                type="button"
                onClick={closeAuthModal}
                className="w-full py-2.5 px-4 bg-surface text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-border/40 focus:outline-none focus:ring-2 focus:ring-primary transition-colors min-h-[44px] flex items-center justify-center"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Normal Auth Flow (Login / Signup) */
          <div>
            {/* Header with Title & Tab Switcher */}
            <div className="px-6 pt-6 pb-4 border-b border-border bg-surface">
              <h2 id="auth-modal-title" className="text-xl font-bold text-neutral-text font-heading mb-1">
                {tab === 'login' ? 'Welcome back to UniDeal' : 'Create your UniDeal account'}
              </h2>
              <p className="text-xs text-neutral-muted">
                {tab === 'login'
                  ? 'Sign in to contact sellers or manage your listings.'
                  : 'Open to all students. Sign up with any email.'}
              </p>

              {/* Tabs */}
              <div className="flex mt-4 bg-white p-1 rounded-md border border-border" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'login'}
                  onClick={() => {
                    setTab('login');
                    setFieldErrors({});
                    setGeneralError(null);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[40px] flex items-center justify-center ${
                    tab === 'login'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-neutral-muted hover:text-neutral-text'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'signup'}
                  onClick={() => {
                    setTab('signup');
                    setFieldErrors({});
                    setGeneralError(null);
                  }}
                  className={`flex-1 py-2 text-sm font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[40px] flex items-center justify-center ${
                    tab === 'signup'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-neutral-muted hover:text-neutral-text'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              {generalError && (
                <div
                  className="p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {tab === 'signup' && (
                <div>
                  <label htmlFor="auth-fullname" className="block text-sm font-medium text-neutral-text mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-muted">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="auth-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) {
                          setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                        }
                      }}
                      placeholder="e.g. Akshit Sharma"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-md border text-sm text-neutral-text placeholder:text-neutral-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px] ${
                        fieldErrors.fullName ? 'border-danger ring-1 ring-danger' : 'border-border'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-xs text-danger font-medium">{fieldErrors.fullName}</p>
                  )}
                  <p className="mt-1 text-[11px] text-neutral-muted">
                    Only your first name is ever displayed publicly on listings.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-neutral-text mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="student@example.com"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-md border text-sm text-neutral-text placeholder:text-neutral-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px] ${
                      fieldErrors.email ? 'border-danger ring-1 ring-danger' : 'border-border'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-danger font-medium">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-neutral-text mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-password"
                    type="password"
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder={tab === 'login' ? 'Your password' : 'At least 6 characters'}
                    className={`w-full pl-9 pr-3 py-2.5 rounded-md border text-sm text-neutral-text placeholder:text-neutral-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px] ${
                      fieldErrors.password ? 'border-danger ring-1 ring-danger' : 'border-border'
                    }`}
                  />
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-danger font-medium">{fieldErrors.password}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : tab === 'login' ? (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-neutral-muted">
                  {tab === 'login' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab(tab === 'login' ? 'signup' : 'login');
                      setFieldErrors({});
                      setGeneralError(null);
                    }}
                    className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
                  >
                    {tab === 'login' ? 'Create one now' : 'Sign in instead'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
