'use client';
import { useEffect, useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
    approved: 'var(--green)',
    pending:  '#d97706',
    rejected: 'var(--red)',
    sold:     'var(--ink-4)',
};

export default function AdminListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/listings/all')
            .then(r => r.json())
            .then(d => { setListings(d.listings ?? []); setLoading(false); });
    }, []);

    const shown = filter === 'all' ? listings : listings.filter(l => l.status === filter);

    return (
        <div style={{ padding: '32px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>All Listings</h1>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {['all', 'approved', 'pending', 'rejected', 'sold'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{
                        padding: '5px 14px', borderRadius: 99,
                        border: '1.5px solid var(--border-2)',
                        background: filter === s ? 'var(--ink)' : 'transparent',
                        color: filter === s ? '#fff' : 'var(--ink)',
                        fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize',
                    }}>
                        {s}
                    </button>
                ))}
            </div>
            {loading && <p style={{ color: 'var(--ink-4)' }}>Loading…</p>}
            {!loading && shown.length === 0 && <p style={{ color: 'var(--ink-4)' }}>No listings found.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {shown.map(l => (
                    <div key={l._id} style={{
                        display: 'flex', gap: 12, padding: '12px 16px',
                        background: 'var(--surface)', border: '1px solid var(--border-2)',
                        borderRadius: 'var(--r-md)', alignItems: 'center',
                    }}>
                        {l.images?.[0] && (
                            <img src={l.images[0]} width={56} height={42}
                                style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} alt="" />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>₹{l.price?.toLocaleString('en-IN')} · {l.seller?.displayName}</div>
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                            background: 'var(--bg-2)', color: STATUS_COLORS[l.status] ?? 'var(--ink)',
                            textTransform: 'capitalize', flexShrink: 0,
                        }}>
                            {l.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
