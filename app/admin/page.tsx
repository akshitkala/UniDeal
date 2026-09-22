'use client';

import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, CheckCircle2, Clock, AlertCircle, AlertTriangle, Users, Loader2 } from 'lucide-react';

export default function AdminOverviewPage() {
  const [approvalMode, setApprovalMode] = useState<'auto' | 'manual'>('auto');
  const [stats, setStats] = useState<{ pending_listings: number; open_reports: number; total_users: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [settingsRes, overviewRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/overview'),
        ]);
        const settingsJson = await settingsRes.json();
        if (settingsRes.ok && settingsJson.data?.approval_mode) {
          setApprovalMode(settingsJson.data.approval_mode);
        } else {
          setError(settingsJson.error?.message || 'Failed to load settings.');
        }
        if (overviewRes.ok) {
          const overviewJson = await overviewRes.json();
          setStats(overviewJson.data ?? null);
        }
      } catch {
        setError('Network error while loading settings.');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleModeChange = async (newMode: 'auto' | 'manual') => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approval_mode: newMode }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message || 'Failed to update approval mode.');
      } else {
        setApprovalMode(json.data.approval_mode);
        setSuccessMessage(`Approval mode set to ${newMode === 'auto' ? 'Auto-Approve' : 'Manual Review'}.`);
      }
    } catch {
      setError('Network error. Failed to save approval mode.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-muted flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading admin settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-text font-heading">
          Platform Settings
        </h1>
        <p className="text-sm text-neutral-muted mt-1">
          Configure listing moderation mode and platform policies.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-md bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Snapshot cards — design (2).md §7.12 (QA-03) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-text font-heading leading-tight">
              {stats ? stats.pending_listings : '—'}
            </p>
            <p className="text-xs text-neutral-muted">Pending Listings</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-text font-heading leading-tight">
              {stats ? stats.open_reports : '—'}
            </p>
            <p className="text-xs text-neutral-muted">Open Reports</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-border flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-text font-heading leading-tight">
              {stats ? stats.total_users : '—'}
            </p>
            <p className="text-xs text-neutral-muted">Total Users</p>
          </div>
        </div>
      </div>

      {/* Moderation Approval Mode Selector */}
      <div className="bg-white p-6 rounded-lg border border-border space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-text font-heading flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>Listing Moderation Mode</span>
            </h2>
            <p className="text-sm text-neutral-muted mt-1">
              Select how newly created listings are published. Changes apply to future listings only.
            </p>
          </div>

          {saving && <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Auto Mode Option */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleModeChange('auto')}
            className={`p-4 rounded-lg border text-left transition-all ${
              approvalMode === 'auto'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border bg-white hover:border-neutral-muted'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-neutral-text flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${approvalMode === 'auto' ? 'text-primary' : 'text-neutral-muted'}`} />
                <span>Auto-Approve (v1 Default)</span>
              </span>
              {approvalMode === 'auto' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-white">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-muted leading-relaxed">
              New listings go live instantly (`status = approved`). Unverified or banned users remain strictly blocked by RLS policies.
            </p>
          </button>

          {/* Manual Mode Option */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleModeChange('manual')}
            className={`p-4 rounded-lg border text-left transition-all ${
              approvalMode === 'manual'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border bg-white hover:border-neutral-muted'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-neutral-text flex items-center gap-2">
                <Clock className={`w-4 h-4 ${approvalMode === 'manual' ? 'text-primary' : 'text-neutral-muted'}`} />
                <span>Manual Review Queue</span>
              </span>
              {approvalMode === 'manual' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary text-white">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-muted leading-relaxed">
              New listings are created with `status = pending` and require explicit admin approval before appearing in public Browse.
            </p>
          </button>
        </div>
      </div>

      {/* Admin System Note */}
      <div className="p-4 rounded-lg bg-surface border border-border flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-muted space-y-1">
          <div className="font-semibold text-neutral-text">Admin Governance Standard</div>
          <p>
            All admin actions (banning users, promoting admins, approving/rejecting listings) re-verify admin privileges server-side via RLS and service-role verification.
          </p>
        </div>
      </div>
    </div>
  );
}
