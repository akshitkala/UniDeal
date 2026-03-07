'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    const [form, setForm] = useState({
        displayName: '', bio: '', location: '', phone: '', whatsappNumber: '',
    });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!loading && !user) router.push('/login?returnTo=/profile');
    }, [user, loading]);

    useEffect(() => {
        if (user) {
            fetch('/api/users/profile')
                .then(r => r.json())
                .then(data => setForm({
                    displayName: data.displayName ?? '',
                    bio: data.bio ?? '',
                    location: data.location ?? '',
                    phone: data.phone ?? '',
                    whatsappNumber: data.whatsappNumber ?? '',
                }));
        }
    }, [user]);

    async function handleSave() {
        setSaving(true);
        const res = await fetch('/api/users/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setSaving(false);
        if (res.ok) {
            setToast('Profile saved ✓');
            setTimeout(() => setToast(''), 3000);
        }
    }

    if (loading || !user) return null;

    const field = (label: string, key: keyof typeof form, help?: string, icon?: string) => (
        <div style={{ marginBottom: 20 }} key={key}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--ink-2)' }}>
                {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}
            </label>
            <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{
                    width: '100%', padding: '12px', border: '1.5px solid var(--border-2)',
                    borderRadius: 'var(--r)', fontFamily: 'var(--font-sans)', fontSize: 14,
                    background: 'var(--surface)', color: 'var(--ink)', outline: 'none',
                    boxSizing: 'border-box',
                }}
            />
            {help && <p style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-4)' }}>{help}</p>}
        </div>
    );

    return (
        <div className="full-height" style={{
            maxWidth: 600,
            margin: '0 auto',
            padding: isMobile ? '24px 16px 100px' : '32px 24px',
        }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 28, fontWeight: 700, marginBottom: isMobile ? 24 : 32 }}>
                Profile Settings
            </h1>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-lg)', padding: isMobile ? 16 : 24, marginBottom: 20 }}>
                <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 20, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Basic Info</h2>
                {field('Display Name', 'displayName')}
                {field('Bio', 'bio')}
                {field('Campus Location', 'location')}
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-lg)', padding: isMobile ? 16 : 24, marginBottom: 20 }}>
                <h2 style={{ fontSize: 12, fontWeight: 700, marginBottom: 20, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact Numbers</h2>
                {field('Account Phone', 'phone', 'Used for OTP only. Never shared.', '🔒')}
                <div style={{ height: 1, background: 'var(--border-2)', margin: '4px 0 20px' }} />
                {field('WhatsApp Number', 'whatsappNumber', 'Buyers will contact you here.', '💬')}
            </div>

            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Email: <strong>{user.email}</strong></span>
                    <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--green)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>VERIFIED</span>
                </p>
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                style={{
                    width: '100%', padding: '14px', background: 'var(--ink)', color: '#fff',
                    border: 'none', borderRadius: 'var(--r)', fontWeight: 600, fontSize: 15,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
            >
                {saving ? 'Saving Changes…' : 'Save Changes'}
            </button>

            {toast && (
                <div style={{
                    position: "fixed", bottom: isMobile ? 90 : 24, left: "50%", transform: "translateX(-50%)",
                    padding: '12px 24px', background: 'var(--ink)', color: 'white', borderRadius: 99,
                    fontSize: 14, fontWeight: 600, boxShadow: "var(--shadow-lg)", zIndex: 1000,
                    animation: "slideInUp 0.3s var(--ease)"
                }}>
                    {toast}
                </div>
            )}
        </div>
    );
}
