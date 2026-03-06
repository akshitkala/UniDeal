'use client';
import { useEffect, useState } from 'react';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/reports')
            .then(r => r.json())
            .then(d => { setReports(d.reports ?? []); setLoading(false); });
    }, []);

    async function dismiss(id: string) {
        await fetch(`/api/admin/moderation/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'dismissed' }),
        });
        setReports(r => r.filter(x => x._id !== id));
    }

    return (
        <div style={{ padding: '32px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Reports</h1>
            {loading && <p style={{ color: 'var(--ink-4)' }}>Loading…</p>}
            {!loading && reports.length === 0 && <p style={{ color: 'var(--ink-4)' }}>No pending reports ✓</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reports.map(r => (
                    <div key={r._id} style={{
                        padding: '14px 16px', background: 'var(--surface)',
                        border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)',
                    }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                            {r.listing?.title ?? 'Unknown listing'}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 8 }}>
                            Reason: {r.reason} · Reported by: {r.reporter?.displayName ?? 'Unknown'}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {r.listing?.slug && (
                                <a
                                    href={`/listings/${r.listing.slug}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ padding: '5px 14px', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}
                                >
                                    View Listing
                                </a>
                            )}
                            <button onClick={() => dismiss(r._id)} style={{
                                padding: '5px 14px', border: '1.5px solid var(--ink-5)',
                                borderRadius: 'var(--r)', fontSize: 13, fontWeight: 600,
                                color: 'var(--ink-4)', background: 'transparent', cursor: 'pointer',
                            }}>
                                Dismiss
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
