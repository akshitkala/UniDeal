'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
        fetch('/api/users/profile', { credentials: 'include' })
          .then(r => r.json())
          .then(d => setProfile(d.user || d));
    }
  }, [user]);

  async function handleDeleteAccount() {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/users/account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to delete account. Please try again.');
        setDeleting(false);
        return;
      }

      // Clear auth and redirect to login
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      router.replace('/login');
    } catch {
      setError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  }

  if (loading || !profile) return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px' }}>

      {/* Profile card */}
      <div style={{
        background: 'white', border: '1.5px solid #e5e7eb',
        borderRadius: 20, padding: 28, marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#f0fdf4', flexShrink: 0,
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 26,
          fontWeight: 900, color: '#16a34a',
        }}>
          {profile.photoURL || profile.photoUrl
            ? <img src={profile.photoURL || profile.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : profile.displayName?.[0]?.toUpperCase() ?? profile.name?.[0]?.toUpperCase() ?? '?'
          }
        </div>
        <div>
          <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>
            {profile.displayName || profile.name}
          </p>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>
            {profile.email}
          </p>
          {profile.registrationNumber && (
            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>
              REG: {profile.registrationNumber}
            </p>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            {(profile.isVerified || profile.emailVerified) && (
              <span style={{
                background: '#f0fdf4', color: '#16a34a',
                border: '1px solid #bbf7d0',
                padding: '2px 8px', borderRadius: 999,
                fontSize: 11, fontWeight: 700,
              }}>
                ✓ VERIFIED
              </span>
            )}
            <span style={{
              background: '#f3f4f6', color: '#6b7280',
              border: '1px solid #e5e7eb',
              padding: '2px 8px', borderRadius: 999,
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            }}>
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div style={{
        background: 'white', border: '1.5px solid #fecaca',
        borderRadius: 20, padding: 28,
      }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#dc2626' }}>
          Danger Zone
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
          Permanently delete your account and all associated data including your listings, saved items, and activity. This action cannot be undone.
        </p>

        {error && (
          <p style={{
            margin: '0 0 16px', fontSize: 13, color: '#dc2626',
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 8, padding: '10px 14px',
          }}>
            ⚠ {error}
          </p>
        )}

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              padding: '11px 24px', borderRadius: 10,
              background: 'white', color: '#dc2626',
              border: '1.5px solid #dc2626',
              fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
            }}
          >
            🗑 Delete My Account
          </button>
        ) : (
          <div style={{
            background: '#fef2f2', border: '1.5px solid #fecaca',
            borderRadius: 14, padding: 20,
          }}>
            <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 14, color: '#111827' }}>
              Are you absolutely sure?
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
              This will permanently delete:
            </p>
            <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: 13, color: '#6b7280', lineHeight: 1.8 }}>
              <li>Your account and profile</li>
              <li>All your listings (active, pending, rejected)</li>
              <li>Your saved listings</li>
              <li>All your reports and activity</li>
            </ul>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  padding: '11px 24px', borderRadius: 10,
                  background: '#dc2626', color: 'white',
                  border: 'none', fontWeight: 700,
                  fontSize: 14, cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => { setShowConfirm(false); setError(''); }}
                disabled={deleting}
                style={{
                  padding: '11px 24px', borderRadius: 10,
                  background: 'white', color: '#374151',
                  border: '1.5px solid #e5e7eb',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
