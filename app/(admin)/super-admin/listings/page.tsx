'use client';
import { useEffect, useState } from 'react';
import SellModal from '@/components/listing/SellModal';

const STATUS_COLORS: Record<string, string> = {
    approved: 'var(--green)',
    pending: '#2D9A54',
    rejected: 'var(--red)',
    sold: 'var(--ink-4)',
};

export default function SuperAdminListingsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState<{ open: boolean, data?: any }>({ open: false });

    const fetchListings = () => {
        setLoading(true);
        const url = showDeleted ? '/api/super-admin/listings/deleted' : '/api/admin/listings/all';
        fetch(url)
            .then(r => r.json())
            .then(d => { setListings(d.listings ?? []); setLoading(false); });
    };

    useEffect(() => {
        fetchListings();
    }, [showDeleted]);

    const handleRestore = async (id: string) => {
        if (!confirm('Restore this listing?')) return;
        const res = await fetch(`/api/super-admin/listings/${id}/restore`, { method: 'POST' });
        if (res.ok) {
            setListings(prev => prev.filter(l => l._id !== id));
        }
    };

    const handleDeletePermanent = async (slug: string) => {
        // For now, delete API is soft-delete. 
        // We might want a permanent delete for superadmins later.
        if (!confirm('This will soft-delete if not already deleted. Continue?')) return;
        const res = await fetch(`/api/listings/${slug}`, { method: 'DELETE' });
        if (res.ok) {
            fetchListings();
        }
    };

    return (
        <div style={{ padding: '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700 }}>Listing Management (Super)</h1>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
                    Show Deleted Only
                </label>
            </div>

            {loading && <p style={{ color: 'var(--ink-4)' }}>Loading…</p>}
            {!loading && listings.length === 0 && <p style={{ color: 'var(--ink-4)' }}>No listings found.</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {listings.map(l => (
                    <div key={l._id} style={{
                        display: 'flex', gap: 12, padding: '16px',
                        background: 'var(--surface)', border: '1px solid var(--border-2)',
                        borderRadius: 'var(--r-md)', alignItems: 'center',
                        opacity: l.isDeleted ? 0.7 : 1
                    }}>
                        {l.images?.[0] && (
                            <img src={l.images[0]} width={64} height={48}
                                style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} alt="" />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {l.title} {l.isDeleted && <span style={{ color: 'var(--red)', fontSize: 10 }}>(DELETED)</span>}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>₹{l.price?.toLocaleString('en-IN')} · {l.seller?.displayName}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            {!l.isDeleted && (
                                <span style={{
                                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
                                    background: 'var(--bg-2)', color: STATUS_COLORS[l.status] ?? 'var(--ink)',
                                    textTransform: 'capitalize', flexShrink: 0,
                                }}>
                                    {l.status}
                                </span>
                            )}

                            {l.isDeleted ? (
                                <button
                                    onClick={() => handleRestore(l._id)}
                                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--green)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                >✨ Restore</button>
                            ) : (
                                <button
                                    onClick={() => handleDeletePermanent(l.slug)}
                                    style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--red-bg)', color: 'var(--red)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                >🗑 Delete</button>
                            )}
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
