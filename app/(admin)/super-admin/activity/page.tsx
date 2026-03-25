'use client';
import { useEffect, useState } from 'react';
import { timeAgo, formatDate } from '@/lib/utils/time';

const ACTION_META: Record<string, { label: string; color: string; icon: string }> = {
    CONFIG_UPDATED: { label: 'Config Updated', color: '#7c3aed', icon: '⚙' },
    APPROVAL_MODE_CHANGED: { label: 'Approval Mode', color: '#7c3aed', icon: '⚙' },
    MAINTENANCE_MODE: { label: 'Maintenance Mode', color: '#ea580c', icon: '🔧' },
    LISTING_APPROVED: { label: 'Listing Approved', color: '#16a34a', icon: '✓' },
    LISTING_REJECTED: { label: 'Listing Rejected', color: '#dc2626', icon: '✗' },
    LISTING_DELETED: { label: 'Listing Deleted', color: '#7f1d1d', icon: '🗑' },
    LISTING_RESTORED: { label: 'Listing Restored', color: '#0891b2', icon: '↩' },
    LISTING_RELISTED: { label: 'Listing Relisted', color: '#2D9A54', icon: '🔄' },
    USER_BANNED: { label: 'User Banned', color: '#7f1d1d', icon: '🚫' },
    USER_UNBANNED: { label: 'User Unbanned', color: '#16a34a', icon: '✓' },
    ROLE_CHANGED: { label: 'Role Changed', color: '#0891b2', icon: '👤' },
    REPORT_DISMISSED: { label: 'Report Dismissed', color: '#6b7280', icon: '⚑' },
    CONTACT_LINK_GENERATED: { label: 'Contact Generated', color: '#1e40af', icon: '📱' },
};

function formatMetadata(action: string, metadata: any): string {
    if (!metadata) return '';
    let m: any;
    try { m = typeof metadata === 'string' ? JSON.parse(metadata) : metadata; } catch { return ''; }

    if (action === 'CONFIG_UPDATED' || action === 'APPROVAL_MODE_CHANGED') {
        const changes = m.changes ?? m;
        const parts: string[] = [];
        if (changes.approvalMode !== undefined) parts.push(`Approval → ${changes.approvalMode}`);
        if (changes.maintenanceMode !== undefined) parts.push(`Maintenance → ${changes.maintenanceMode ? 'ON' : 'OFF'}`);
        if (changes.allowNewListings !== undefined) parts.push(`New listings → ${changes.allowNewListings ? 'ON' : 'OFF'}`);
        return parts.join(' · ') || JSON.stringify(changes);
    }
    if (action === 'LISTING_APPROVED' || action === 'LISTING_DELETED' || action === 'LISTING_RESTORED' || action === 'LISTING_RELISTED') {
        return m.title ? `"${m.title}"` : '';
    }
    if (action === 'LISTING_REJECTED') {
        return `"${m.title}"${m.reason ? ` · Reason: ${m.reason}` : ''}`;
    }
    if (action === 'USER_BANNED' || action === 'USER_UNBANNED') {
        return `${m.targetName ?? m.targetUid ?? ''}`;
    }
    if (action === 'ROLE_CHANGED') {
        return `${m.targetName ?? m.targetUid} · ${m.oldRole} → ${m.newRole}`;
    }
    const str = JSON.stringify(m);
    return str === '{}' ? '' : str;
}



export default function ActivityPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [showIps, setShowIps] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/super-admin/activity?page=${page}&showIps=${showIps}`)
            .then(r => r.json())
            .then(d => {
                setActivities(d.activities ?? []);
                setTotal(d.total ?? 0);
                setPages(d.pages ?? 1);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [page, showIps]);

    return (
        <div style={{ padding: '32px 24px', maxWidth: 900 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
                        Activity Log
                    </h1>
                    <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>
                        {total} total actions logged
                    </p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', userSelect: 'none', marginTop: 4 }}>
                    <input type="checkbox" checked={showIps} onChange={e => setShowIps(e.target.checked)} />
                    Show IPs
                </label>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{ height: 60, background: 'var(--bg-2)', borderRadius: 'var(--r)', animation: 'pulse 1.5s ease infinite' }} />
                    ))}
                </div>
            )}

            {/* Entries */}
            {!loading && activities.map((a, i) => {
                const meta = ACTION_META[a.action] ?? { label: a.action, color: '#6b7280', icon: '•' };
                const detail = formatMetadata(a.action, a.metadata);
                const date = a.createdAt ?? a.timestamp;
                const actor = a.actorName ?? a.actor?.displayName ?? a.actor?.email ?? 'System';

                return (
                    <div key={i} style={{
                        display: 'grid',
                        gridTemplateColumns: '36px 1fr auto',
                        gap: '0 14px',
                        alignItems: 'start',
                        padding: '14px 0',
                        borderBottom: '1px solid var(--border-2)',
                    }}>
                        {/* Icon bubble */}
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: `${meta.color}18`,
                            display: 'grid', placeItems: 'center',
                            fontSize: 15, flexShrink: 0,
                        }}>
                            {meta.icon}
                        </div>

                        {/* Content */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: 12, fontWeight: 700, padding: '2px 8px',
                                    borderRadius: 99, background: `${meta.color}18`, color: meta.color,
                                }}>
                                    {meta.label}
                                </span>
                                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                                    by <span style={{ fontWeight: 600 }}>{actor}</span>
                                </span>
                            </div>

                            {detail && (
                                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)' }}>
                                    {detail}
                                </div>
                            )}

                            {showIps && a.ipAddress && (
                                <div style={{ marginTop: 3, fontSize: 11, color: 'var(--ink-5)', fontFamily: 'var(--font-mono)' }}>
                                    {a.ipAddress}
                                </div>
                            )}
                        </div>

                        {/* Time */}
                        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                            <div style={{ fontSize: 12, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>
                                {timeAgo(date)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ink-5)', marginTop: 2, whiteSpace: 'nowrap' }}>
                                {date ? formatDate(date) : ''}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Empty state */}
            {!loading && activities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-4)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                    <div style={{ fontWeight: 600 }}>No activity logged yet</div>
                </div>
            )}

            {/* Pagination */}
            {!loading && total > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            padding: '7px 16px', borderRadius: 'var(--r)',
                            border: '1.5px solid var(--border-2)', cursor: page === 1 ? 'not-allowed' : 'pointer',
                            background: 'transparent', opacity: page === 1 ? 0.4 : 1,
                        }}
                    >
                        ← Prev
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>
                        Page {page} of {pages}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= pages}
                        style={{
                            padding: '7px 16px', borderRadius: 'var(--r)',
                            border: '1.5px solid var(--border-2)', cursor: page >= pages ? 'not-allowed' : 'pointer',
                            background: 'transparent', opacity: page >= pages ? 0.4 : 1,
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
