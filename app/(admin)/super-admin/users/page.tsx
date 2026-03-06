'use client';
import { useEffect, useState } from 'react';

export default function SuperAdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/users')
            .then(r => r.json())
            .then(d => { setUsers(d.users ?? []); setLoading(false); });
    }, []);

    async function changeRole(uid: string, role: string) {
        await fetch(`/api/super-admin/users/${uid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
        });
        setUsers(u => u.map(x => x.uid === uid ? { ...x, role } : x));
    }

    return (
        <div style={{ padding: '32px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Manage Roles</h1>
            <p style={{ color: 'var(--ink-4)', marginBottom: 24, fontSize: 13 }}>
                Promote or demote users. Changes take effect on next login.
            </p>
            {loading && <p style={{ color: 'var(--ink-4)' }}>Loading…</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map(u => (
                    <div key={u._id} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)',
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.displayName}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{u.email}</div>
                        </div>
                        <select
                            value={u.role}
                            onChange={e => changeRole(u.uid, e.target.value)}
                            style={{
                                padding: '6px 12px', borderRadius: 'var(--r)',
                                border: '1.5px solid var(--border-2)',
                                fontFamily: 'var(--font-sans)', fontSize: 13,
                                background: 'var(--surface)', cursor: 'pointer',
                            }}
                        >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="superadmin">superadmin</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
}
