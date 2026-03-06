'use client';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function SuperAdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

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
        <div style={{
            padding: isMobile ? '24px 16px 100px' : '32px 24px',
            minHeight: "100dvh"
        }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 28, fontWeight: 700, marginBottom: 8 }}>Manage Roles</h1>
            <p style={{ color: 'var(--ink-4)', marginBottom: 24, fontSize: 13 }}>
                Promote or demote users. Changes take effect on next login.
            </p>
            {loading && (
                <div style={{ padding: 40, textAlign: "center", color: "var(--ink-4)" }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: 12 }}>Loading users...</p>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {users.map(u => (
                    <div key={u._id} style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'stretch' : 'center',
                        gap: 16,
                        padding: isMobile ? 16 : '12px 20px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border-2)',
                        borderRadius: 'var(--r-md)',
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{u.displayName}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-4)', wordBreak: 'break-all' }}>{u.email}</div>
                        </div>
                        <div style={{
                            borderTop: isMobile ? '1px solid var(--border-2)' : 'none',
                            paddingTop: isMobile ? 12 : 0,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Role:</span>
                            <select
                                value={u.role}
                                onChange={e => changeRole(u.uid, e.target.value)}
                                style={{
                                    flex: isMobile ? 1 : 'none',
                                    padding: '8px 12px', borderRadius: 'var(--r)',
                                    border: '1.5px solid var(--border-2)',
                                    fontFamily: 'var(--font-sans)', fontSize: 13,
                                    background: 'var(--surface)', cursor: 'pointer',
                                    fontWeight: 600, color: 'var(--ink-2)'
                                }}
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
