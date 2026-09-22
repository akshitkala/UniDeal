'use client';

import React, { useState } from 'react';
import type { ContactInput } from '@/lib/validation/contact';

type FieldErrors = Partial<Record<keyof ContactInput, string>>;

export default function ContactForm() {
  const [form, setForm] = useState<ContactInput>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (form.name.trim().length > 100) e.name = 'Name cannot exceed 100 characters.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
    if (form.message.trim().length > 1000) e.message = 'Message cannot exceed 1000 characters.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus('submitting');
    setServerError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error?.message ?? "Couldn't send your message. Please try again.");
        setStatus('error');
      } else {
        setStatus('sent');
      }
    } catch {
      setServerError("Couldn't send your message. Please check your connection and try again.");
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div
        role="alert"
        className="rounded-md bg-primary/5 border border-primary/20 p-6 text-center"
      >
        <p className="font-semibold text-neutral-text">Message sent — we&rsquo;ll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-neutral-text mb-1">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={`w-full px-3 py-2.5 rounded-md border text-sm text-neutral-text bg-white placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.name ? 'border-danger focus:ring-danger' : 'border-border'
          }`}
          placeholder="Your name"
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p id="contact-name-error" role="alert" className="mt-1 text-xs text-danger">
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-neutral-text mb-1">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className={`w-full px-3 py-2.5 rounded-md border text-sm text-neutral-text bg-white placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
            errors.email ? 'border-danger focus:ring-danger' : 'border-border'
          }`}
          placeholder="you@example.com"
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="contact-email-error" role="alert" className="mt-1 text-xs text-danger">
            {errors.email}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-neutral-text mb-1">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={`w-full px-3 py-2.5 rounded-md border text-sm text-neutral-text bg-white placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none ${
            errors.message ? 'border-danger focus:ring-danger' : 'border-border'
          }`}
          placeholder="Your message…"
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          aria-invalid={!!errors.message}
        />
        <div className="flex items-start justify-between mt-1">
          {errors.message ? (
            <p id="contact-message-error" role="alert" className="text-xs text-danger">
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-xs text-neutral-muted ml-auto">{form.message.length}/1000</span>
        </div>
      </div>

      {/* Server error */}
      {status === 'error' && serverError && (
        <p role="alert" className="text-sm text-danger">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full py-2.5 px-4 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[44px]"
      >
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}
