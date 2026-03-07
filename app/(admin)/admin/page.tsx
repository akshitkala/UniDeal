'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [filter, setFilter] = useState<'all' | 'flagged'>('all');
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
            router.replace('/login?returnTo=/admin');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'superadmin')) {
            fetch('/api/admin/listings')
                .then(r => r.json())
                .then(d => { setListings(d.listings ?? []); setLoading(false); });
        }
    }, [user]);

    if (authLoading || (!user || (user.role !== 'admin' && user.role !== 'superadmin'))) {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: 12 }}>Verifying admin access...</p>
            </div>
        );
    }

    async function approve(id: string) {
        await fetch(`/api/admin/listings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve' }),
        });
        setListings(l => l.filter(x => x._id !== id));
    }

    async function reject(id: string) {
        const reason = window.prompt('Rejection reason:');
        if (!reason) return;
        await fetch(`/api/admin/listings/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
        });
        setListings(l => l.filter(x => x._id !== id));
    }

    const shown = filter === 'flagged' ? listings.filter(l => l.aiFlagged) : listings;

    return (
        <div style={{ padding: '32px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Pending Queue</h1>
            <p style={{ color: 'var(--ink-4)', marginBottom: 24 }}>
                {listings.length} listings awaiting review · {listings.filter(l => l.aiFlagged).length} flagged by AI
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {(['all', 'flagged'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '6px 16px', borderRadius: 99,
                        border: '1.5px solid var(--border-2)',
                        background: filter === f ? 'var(--ink)' : 'transparent',
                        color: filter === f ? '#fff' : 'var(--ink)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}>
                        {f === 'all' ? 'All' : '🚩 AI Flagged'}
                    </button>
                ))}
            </div>

            {loading && <p style={{ color: 'var(--ink-4)' }}>Loading…</p>}
            {!loading && shown.length === 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', padding: '64px 24px', textAlign: 'center',
                }}>
                    <span style={{ fontSize: 48, marginBottom: 16 }}>✅</span>
                    <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>
                        All caught up
                    </h2>
                    <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: 0 }}>
                        No listings waiting for review
                    </p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {shown.map(l => (
                    <div key={l._id} style={{
                        background: l.aiFlagged ? '#FEF2F2' : 'var(--surface)',
                        border: l.aiFlagged ? '1px solid #fca5a5' : '1px solid var(--border-2)',
                        borderLeft: l.aiFlagged ? '3px solid #B91C1C' : undefined,
                        borderRadius: 'var(--r-md)', padding: 16,
                        display: 'flex', gap: 16, alignItems: 'flex-start',
                    }}>
                        {l.images?.[0] && (
                            <img src={l.images[0]} width={80} height={60}
                                style={{ borderRadius: 'var(--r)', objectFit: 'cover', flexShrink: 0 }} alt="" />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>{l.title}</span>
                                {l.aiFlagged && (
                                    <span style={{ background: '#B91C1C', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                                        {l.aiFlagReason?.startsWith('Image mismatch') ? '🖼 IMAGE MISMATCH' : '🤖 AI FLAGGED'}
                                    </span>
                                )}
                            </div>
                            {l.aiFlagged && l.aiFlagReason && (
                                <div style={{
                                    background: '#fee2e2', border: '1px solid #fca5a5',
                                    borderRadius: 8, padding: '6px 10px',
                                    fontSize: 12, color: '#b91c1c',
                                    marginBottom: 8, display: 'flex', gap: 6,
                                }}>
                                    <span>{l.aiFlagReason?.startsWith('Image mismatch') ? '🖼 Image Mismatch' : '🤖 AI Flagged'}</span>
                                    <span>— {l.aiFlagReason}</span>
                                </div>
                            )}
                            <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 8 }}>
                                ₹{l.price?.toLocaleString('en-IN')} · {l.condition} · {l.category?.name} · by {l.seller?.displayName}
                            </div>
                            {(l.aiVerification?.confidence ?? 0) > 0 && (
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 3 }}>
                                        AI confidence: {Math.round((l.aiVerification.confidence ?? 0) * 100)}%
                                    </div>
                                    <div style={{ width: 80, height: 6, background: 'var(--bg-3)', borderRadius: 3 }}>
                                        <div style={{
                                            width: `${(l.aiVerification.confidence ?? 0) * 100}%`, height: '100%', borderRadius: 3,
                                            background: (l.aiVerification.confidence ?? 0) > 0.66 ? '#dc2626'
                                                : (l.aiVerification.confidence ?? 0) > 0.33 ? '#d97706' : '#16a34a',
                                        }} />
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => approve(l._id)} style={{
                                    padding: '6px 16px', border: '1.5px solid var(--green)',
                                    color: 'var(--green)', background: 'transparent',
                                    borderRadius: 'var(--r)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                }}>Approve</button>
                                <button onClick={() => reject(l._id)} style={{
                                    padding: '6px 16px', border: '1.5px solid var(--red)',
                                    color: 'var(--red)', background: 'transparent',
                                    borderRadius: 'var(--r)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                }}>Reject</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
