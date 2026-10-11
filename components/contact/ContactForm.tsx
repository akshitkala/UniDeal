'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Check, Flag, ShieldAlert, UserMinus } from 'lucide-react';

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface TouchedState {
  name: boolean;
  email: boolean;
  message: boolean;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function ContactForm() {
  const { user } = useAuth();
  const supabase = createClient();

  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [touched, setTouched] = useState<TouchedState>({ name: false, email: false, message: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // Prefill logged-in user details: email from session, full_name from profile
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    // Prefill email immediately from user session if not yet modified by user
    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email || '',
    }));

    async function loadProfileName() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user!.id)
          .maybeSingle();

        if (!cancelled && data?.full_name) {
          setForm((prev) => ({
            ...prev,
            name: prev.name || data.full_name,
          }));
        }
      } catch {
        // Keep existing form state on error
      }
    }

    loadProfileName();

    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  // Focus success heading on transition to 'sent'
  useEffect(() => {
    if (status === 'sent') {
      successHeadingRef.current?.focus();
    }
  }, [status]);

  function validateField(field: keyof FormState, value: string): string | undefined {
    const trimmed = value.trim();
    if (field === 'name') {
      if (!trimmed || trimmed.length < 2) return 'Name must be at least 2 characters';
      if (trimmed.length > 100) return 'Name cannot exceed 100 characters';
    }
    if (field === 'email') {
      if (!trimmed) return 'Email is required';
      // Standard email regex matching Zod email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) return 'Please enter a valid email address';
    }
    if (field === 'message') {
      if (!trimmed || trimmed.length < 10) return 'Message must be at least 10 characters';
      if (trimmed.length > 1000) return 'Message cannot exceed 1000 characters';
    }
    return undefined;
  }

  function validateAll(): FieldErrors {
    const nextErrors: FieldErrors = {};
    const nameErr = validateField('name', form.name);
    if (nameErr) nextErrors.name = nameErr;

    const emailErr = validateField('email', form.email);
    if (emailErr) nextErrors.email = emailErr;

    const messageErr = validateField('message', form.message);
    if (messageErr) nextErrors.message = messageErr;

    return nextErrors;
  }

  function handleBlur(field: keyof FormState) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, form[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: errorMsg,
    }));
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: errorMsg,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return; // block double submits

    setTouched({ name: true, email: true, message: true });
    const validationErrors = validateAll();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus the first invalid field
      if (validationErrors.name) {
        nameInputRef.current?.focus();
      } else if (validationErrors.email) {
        emailInputRef.current?.focus();
      } else if (validationErrors.message) {
        messageInputRef.current?.focus();
      }
      return;
    }

    setStatus('submitting');
    setServerError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      if (!res.ok) {
        // TRD §5.12 / Prompt spec: Never show raw error text, status codes, or Resend messages
        setServerError("Couldn't send your message. Check your connection and try again.");
        setStatus('error');
      } else {
        setStatus('sent');
      }
    } catch {
      setServerError("Couldn't send your message. Check your connection and try again.");
      setStatus('error');
    }
  }

  function handleReset() {
    setForm({
      name: user ? form.name : '',
      email: user?.email ?? '',
      message: '',
    });
    setTouched({ name: false, email: false, message: false });
    setErrors({});
    setServerError(null);
    setStatus('idle');
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-10">
      {/* Form column (about 60% on desktop, max-w-xl) */}
      <div className="w-full lg:w-[60%] max-w-xl">
        {status === 'sent' ? (
          <div
            className="border border-border rounded-md p-6 md:p-8 bg-surface"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-primary" aria-hidden="true" />
              </span>
              <h2
                ref={successHeadingRef}
                tabIndex={-1}
                className="text-xl font-bold text-neutral-text font-heading focus:outline-none"
              >
                Message sent
              </h2>
            </div>
            <p className="mt-3 text-base text-neutral-muted font-body">
              We&apos;ll get back to you soon.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-primary text-white text-base font-medium rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 motion-reduce:transition-none transition-colors"
              >
                Back to Browse
              </Link>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 text-neutral-text text-base font-medium rounded-md hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 motion-reduce:transition-none transition-colors"
              >
                Send another message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Server failure banner above button */}
            {serverError && (
              <div
                role="alert"
                className="p-4 border border-danger/30 rounded-md bg-danger/5 text-danger text-sm font-medium"
              >
                {serverError}
              </div>
            )}

            {/* Name field */}
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium text-neutral-text mb-1.5 font-body"
              >
                Name
              </label>
              <input
                ref={nameInputRef}
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="Your name"
                className={`w-full h-12 px-3.5 text-base rounded-md border bg-surface text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors ${
                  errors.name ? 'border-danger focus:ring-danger' : 'border-border'
                }`}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
              />
              {errors.name && (
                <p id="contact-name-error" className="mt-1.5 text-sm text-danger font-medium font-body">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium text-neutral-text mb-1.5 font-body"
              >
                Email
              </label>
              <input
                ref={emailInputRef}
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                className={`w-full h-12 px-3.5 text-base rounded-md border bg-surface text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors ${
                  errors.email ? 'border-danger focus:ring-danger' : 'border-border'
                }`}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
              />
              {errors.email && (
                <p id="contact-email-error" className="mt-1.5 text-sm text-danger font-medium font-body">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Message field */}
            <div>
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium text-neutral-text mb-1.5 font-body"
              >
                Message
              </label>
              <textarea
                ref={messageInputRef}
                id="contact-message"
                name="message"
                rows={6}
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                placeholder="How can we help?"
                className={`w-full min-h-[160px] resize-y px-3.5 py-3 text-base rounded-md border bg-surface text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-accent motion-reduce:transition-none transition-colors ${
                  errors.message ? 'border-danger focus:ring-danger' : 'border-border'
                }`}
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby="contact-message-counter contact-message-error"
              />
              <div className="flex items-start justify-between mt-1.5">
                {errors.message ? (
                  <p id="contact-message-error" className="text-sm text-danger font-medium font-body">
                    {errors.message}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  id="contact-message-counter"
                  className="text-xs text-neutral-muted ml-auto font-body"
                >
                  {form.message.length}/1000
                </span>
              </div>
            </div>

            {/* Submit section */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full md:w-auto min-h-[44px] px-6 py-2.5 bg-primary text-white text-base font-medium rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed motion-reduce:transition-none transition-colors"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
              <p className="mt-2 text-sm text-neutral-muted font-body">
                We&apos;ll reply to the email address above.
              </p>
            </div>
          </form>
        )}
      </div>

      {/* "Before you write" Panel (about 40% on desktop, top-aligned) */}
      <aside className="w-full lg:w-[40%] border border-border rounded-md bg-surface p-6 font-body">
        <h2 className="text-lg font-bold text-neutral-text font-heading pb-4 border-b border-border">
          Before you write
        </h2>

        <div className="divide-y divide-border">
          {/* Row 1 */}
          <div className="py-4 space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-text font-bold text-sm">
              <Flag className="w-4 h-4 text-neutral-muted shrink-0" aria-hidden="true" />
              <span>Reporting a listing?</span>
            </div>
            <p className="text-sm text-neutral-muted leading-relaxed">
              Use the Report button at the bottom of the listing page, so it goes straight to a moderator.
            </p>
            <div className="pt-1">
              <Link
                href="/browse"
                className="inline-flex items-center text-sm font-medium text-neutral-text hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent rounded motion-reduce:transition-none transition-colors min-h-[44px] py-2"
              >
                Browse listings &rarr;
              </Link>
            </div>
          </div>

          {/* Row 2 */}
          <div className="py-4 space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-text font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-neutral-muted shrink-0" aria-hidden="true" />
              <span>Safety concern?</span>
            </div>
            <p className="text-sm text-neutral-muted leading-relaxed">
              Read our safety tips first, then write to us if something still feels off.
            </p>
            <div className="pt-1">
              <Link
                href="/safety"
                className="inline-flex items-center text-sm font-medium text-neutral-text hover:text-primary focus:outline-none focus:ring-2 focus:ring-accent rounded motion-reduce:transition-none transition-colors min-h-[44px] py-2"
              >
                Safety tips &rarr;
              </Link>
            </div>
          </div>

          {/* Row 3 */}
          <div className="py-4 space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-text font-bold text-sm">
              <UserMinus className="w-4 h-4 text-neutral-muted shrink-0" aria-hidden="true" />
              <span>Want your account deleted?</span>
            </div>
            <p className="text-sm text-neutral-muted leading-relaxed">
              Tell us the email you signed up with in your message and we&apos;ll take care of it.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="pt-4 mt-1 border-t border-border">
          <p className="text-xs text-neutral-muted">
            Messages go straight to the founder&apos;s inbox.
          </p>
        </div>
      </aside>
    </div>
  );
}
