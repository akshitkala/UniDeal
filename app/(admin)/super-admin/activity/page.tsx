'use client';
import { useEffect, useState } from 'react';

const ACTION_COLORS: Record<string, string> = {
    LISTING_APPROVED:       '#16a34a',
    LISTING_REJECTED:       '#dc2626',
    USER_BANNED:            '#7f1d1d',
    USER_UNBANNED:          '#16a34a',
    CONTACT_LINK_GENERATED: '#1e40af',
    REPORT_SUBMITTED:       '#d97706',
    CONFIG_UPDATED:         '#7c3aed',
    ROLE_CHANGED:           '#0891b2',
};

export default function ActivityPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [showIps, setShowIps] = useState(false);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/super-admin/activity?page=${page}&showIps=${showIps}`)
            .then(r => r.json())
            .then(d => { setActivities(d.activities ?? []); setTotal(d.total ?? 0); setLoading(false); });
    }, [page, showIps]);

    return (
        <div style={{ padding: '32px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Activity Log</h1>
                    <p style={{ color: 'var(--ink-4)', fontSize: 13 }}>{total} total actions logged</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showIps} onChange={e => setShowIps(e.target.checked)} />
                    Show IPs
                </label>
            </div>

            {loading && <p style={{ color: 'var(--ink-4)' }}>Loading…</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {activities.map((a, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                        background: 'var(--surface)', border: '1px solid var(--border-2)',
                        borderRadius: 'var(--r-md)',
                    }}>
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                            background: `${ACTION_COLORS[a.action] ?? '#666'}22`,
                            color: ACTION_COLORS[a.action] ?? '#666', whiteSpace: 'nowrap',
                        }}>
                            {a.action}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--ink-3)', flex: 1 }}>{a.ipAddress}</span>
                        <span style={{ fontSize: 12, color: 'var(--ink-5)', whiteSpace: 'nowrap' }}>
                            {new Date(a.timestamp ?? a.createdAt).toLocaleString('en-IN')}
                        </span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20, alignItems: 'center' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                    padding: '6px 16px', borderRadius: 'var(--r)', border: '1.5px solid var(--border-2)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer', background: 'transparent', opacity: page === 1 ? 0.5 : 1,
                }}>← Prev</button>
                <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--ink-4)' }}>Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={activities.length < 20} style={{
                    padding: '6px 16px', borderRadius: 'var(--r)', border: '1.5px solid var(--border-2)',
                    cursor: activities.length < 20 ? 'not-allowed' : 'pointer', background: 'transparent', opacity: activities.length < 20 ? 0.5 : 1,
                }}>Next →</button>
            </div>
        </div>
    );
}
