'use client';
import { useEffect, useState } from 'react';
import SellModal from '@/components/listing/SellModal';

const STATUS_COLORS: Record<string, string> = {
    approved: 'var(--green)',
    pending: '#2D9A54',
    rejected: 'var(--red)',
    sold: 'var(--ink-4)',
};

export default function AdminListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState<{ open: boolean, data?: any }>({ open: false });

    const fetchAll = () => {
        setLoading(true);
        fetch('/api/admin/listings/all')
            .then(r => r.json())
            .then(d => { setListings(d.listings ?? []); setLoading(false); });
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleDelete = async (slug: string) => {
        if (!confirm('Delete this listing as Admin?')) return;
        const res = await fetch(`/api/listings/${slug}`, { method: 'DELETE' });
        if (res.ok) {
            setListings(prev => prev.filter(l => l.slug !== slug));
        }
    };

    const shown = filter === 'all' ? listings : listings.filter(l => l.status === filter);

    return (
        <div style={{ padding: '32px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>All Listings (Admin)</h1>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {shown.map(l => (
                    <div key={l._id} style={{
                        display: 'flex', gap: 12, padding: '16px',
                        background: 'var(--surface)', border: '1px solid var(--border-2)',
                        borderRadius: 'var(--r-md)', alignItems: 'center',
                    }}>
                        {l.images?.[0] && (
                            <img src={l.images[0]} width={64} height={48}
                                style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} alt="" />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>₹{l.price?.toLocaleString('en-IN')} · {l.seller?.displayName}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{
                                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                                background: 'var(--bg-2)', color: STATUS_COLORS[l.status] ?? 'var(--ink)',
                                textTransform: 'capitalize', flexShrink: 0,
                            }}>
                                {l.status}
                            </span>

                            <button
                                onClick={() => handleDelete(l.slug)}
                                style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--red-bg)', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                            >🗑 Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {editModal.open && (
                <SellModal
                    isOpen={editModal.open}
                    onClose={() => setEditModal({ open: false })}
                    mode="edit"
                    initialData={editModal.data}
                    onSuccess={(updated) => {
                        setListings(prev => prev.map(l => l.slug === updated.slug ? { ...l, ...updated } : l));
                    }}
                />
            )}
        </div>
    );
}
