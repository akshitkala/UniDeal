'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Loader2 } from 'lucide-react';

interface ProfileForm {
  full_name: string;
  branch: string;
  year: string;
  whatsapp_number: string;
}

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export default function ProfilePage() {
  const { user, refreshUser, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<ProfileForm>({
    full_name: '',
    branch: '',
    year: '',
    whatsapp_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<ProfileForm>>({});
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!user) return;
    async function load() {
      // QA-02: whatsapp_number is REVOKE'd from client roles — load the whole
      // profile via the owner-only server route instead of a direct query.
      try {
        const res = await fetch('/api/profile');
        const json = await res.json();
        if (res.ok && json.data) {
          setForm({
            full_name: json.data.full_name ?? '',
            branch: json.data.branch ?? '',
            year: json.data.year ?? '',
            whatsapp_number: json.data.whatsapp_number ?? '',
          });
        }
      } catch {
        // keep defaults; save still works independently
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function validate(): Partial<ProfileForm> {
    const e: Partial<ProfileForm> = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 2)
      e.full_name = 'Name must be at least 2 characters.';
    if (form.full_name.trim().length > 100)
      e.full_name = 'Name cannot exceed 100 characters.';
    if (form.whatsapp_number && !/^\+[1-9]\d{6,14}$/.test(form.whatsapp_number.trim()))
      e.whatsapp_number = 'Enter a valid number in E.164 format, e.g. +919876543210.';
    return e;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setSaving(true);
    setError('');
    setSaved(false);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        branch: form.branch.trim() || null,
        year: form.year || null,
        whatsapp_number: form.whatsapp_number.trim() || null,
      })
      .eq('id', user!.id);

    setSaving(false);
    if (updateError) {
      setError("Couldn't save your profile. Please try again.");
    } else {
      setSaved(true);
      await refreshUser();
      setTimeout(() => setSaved(false), 3000);
    }
  }

  // Destructive, irreversible action — explicit confirm first (same lightweight
  // window.confirm pattern as Admin › Users Promote/Ban, no modal wizard).
  async function handleDeleteAccount() {
    if (
      !window.confirm(
        'Delete your account permanently? Your profile, all your listings, and your saved WhatsApp number will be removed. This cannot be undone.'
      )
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setDeleteError(json?.error?.message || "Couldn't delete your account. Please try again.");
        return;
      }
      await signOut();
      router.push('/');
      router.refresh();
    } catch {
      setDeleteError("Couldn't delete your account. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <p className="text-neutral-muted text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <h1 className="text-2xl font-bold text-neutral-text font-heading mb-1">Your Profile</h1>
        <p className="text-sm text-neutral-muted mb-8">
          Your WhatsApp number is never shown publicly — it&rsquo;s only used when a buyer taps
          &ldquo;Contact Seller&rdquo; on one of your listings.
        </p>

        <form onSubmit={handleSave} noValidate className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-neutral-text mb-1">
              Full Name <span className="text-danger" aria-hidden="true">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-md border text-sm bg-white text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                fieldErrors.full_name ? 'border-danger focus:ring-danger' : 'border-border'
              }`}
              placeholder="e.g. Akshit Sharma"
              aria-required="true"
              aria-invalid={!!fieldErrors.full_name}
              aria-describedby={fieldErrors.full_name ? 'profile-name-error' : undefined}
            />
            {fieldErrors.full_name && (
              <p id="profile-name-error" role="alert" className="mt-1 text-xs text-danger">
                {fieldErrors.full_name}
              </p>
            )}
          </div>

          {/* Branch */}
          <div>
            <label htmlFor="profile-branch" className="block text-sm font-medium text-neutral-text mb-1">
              Branch <span className="text-neutral-muted font-normal">(optional)</span>
            </label>
            <input
              id="profile-branch"
              type="text"
              value={form.branch}
              onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-white text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              placeholder="e.g. Computer Science"
            />
          </div>

          {/* Year */}
          <div>
            <label htmlFor="profile-year" className="block text-sm font-medium text-neutral-text mb-1">
              Year <span className="text-neutral-muted font-normal">(optional)</span>
            </label>
            <select
              id="profile-year"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-md border border-border text-sm bg-white text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <option value="">Select year</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label htmlFor="profile-whatsapp" className="block text-sm font-medium text-neutral-text mb-1">
              WhatsApp Number <span className="text-neutral-muted font-normal">(optional)</span>
            </label>
            <input
              id="profile-whatsapp"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={form.whatsapp_number}
              onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-md border text-sm bg-white text-neutral-text placeholder:text-neutral-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                fieldErrors.whatsapp_number ? 'border-danger focus:ring-danger' : 'border-border'
              }`}
              placeholder="+919876543210"
              aria-invalid={!!fieldErrors.whatsapp_number}
              aria-describedby="profile-whatsapp-hint profile-whatsapp-error"
            />
            <p id="profile-whatsapp-hint" className="mt-1 text-xs text-neutral-muted">
              International format required, e.g. +919876543210. Never shown publicly.
            </p>
            {fieldErrors.whatsapp_number && (
              <p id="profile-whatsapp-error" role="alert" className="mt-1 text-xs text-danger">
                {fieldErrors.whatsapp_number}
              </p>
            )}
          </div>

          {/* Server error */}
          {error && (
            <p role="alert" className="text-sm text-danger">{error}</p>
          )}

          {/* Success */}
          {saved && (
            <p role="status" className="text-sm text-primary">Profile saved.</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto py-2.5 px-6 bg-primary text-white rounded-md font-medium text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* Danger zone — account deletion */}
        <div className="mt-10 pt-6 border-t border-border">
          <h2 className="text-sm font-semibold text-neutral-text">Delete Account</h2>
          <p className="text-xs text-neutral-muted mt-1">
            Permanently deletes your account, your profile, and all of your listings. This cannot be undone.
          </p>
          {deleteError && (
            <p role="alert" className="mt-2 text-sm text-danger">{deleteError}</p>
          )}
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="mt-3 px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-md text-sm font-semibold hover:bg-danger/20 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors min-h-[44px] flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Account</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
