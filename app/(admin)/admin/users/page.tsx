'use client';
import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/users')
            .then(r => r.json())
            .then(d => { setUsers(d.users ?? []); setLoading(false); });
    }, []);

    async function toggle(uid: string, isActive: boolean) {
        await fetch(`/api/admin/users/${uid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: isActive ? 'ban' : 'unban' }),
        });
        setUsers(u => u.map(x => x.uid === uid ? { ...x, isActive: !isActive } : x));
    }

    return (
        <div style={{ padding: '32px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Users</h1>
            {loading && <p style={{ color: 'var(--ink-4)' }}>Loading…</p>}
            {!loading && users.length === 0 && <p style={{ color: 'var(--ink-4)' }}>No users found.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map(u => (
                    <div key={u._id} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        background: 'var(--surface)', border: '1px solid var(--border-2)',
                        borderRadius: 'var(--r-md)',
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)',
                            display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                            {u.displayName?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{u.email} · {u.role}</div>
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                            background: u.isActive ? 'var(--green-bg)' : 'var(--red-bg)',
                            color: u.isActive ? 'var(--green)' : 'var(--red)',
                        }}>
                            {u.isActive ? 'Active' : 'Banned'}
                        </span>
                        <button onClick={() => toggle(u.uid, u.isActive)} style={{
                            padding: '6px 14px',
                            border: `1.5px solid ${u.isActive ? 'var(--red)' : 'var(--green)'}`,
                            color: u.isActive ? 'var(--red)' : 'var(--green)',
                            background: 'transparent', borderRadius: 'var(--r)',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer',
                        }}>
                            {u.isActive ? 'Ban' : 'Unban'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
