'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, Shield, ShieldCheck, UserX, UserCheck, Search, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
  branch: string | null;
  year: string | null;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

export default function AdminUserManagementPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('public_profiles')
        .select('id, full_name, branch, year, is_admin, is_banned, created_at')
        .order('created_at', { ascending: false });

      if (!fetchErr && data) {
        setUsers(data as UserProfile[]);
      } else {
        setError(fetchErr?.message || 'Failed to fetch users.');
      }
    } catch {
      setError('Network error fetching user list.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    setActionUserId(userId);
    setError(null);
    const endpoint = currentlyBanned ? `/api/admin/users/${userId}/unban` : `/api/admin/users/${userId}/ban`;
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || 'Ban status update failed.');
      } else {
        await fetchUsers();
      }
    } catch {
      setError('Network error during user action.');
    } finally {
      setActionUserId(null);
    }
  };

  const handlePromote = async (userId: string) => {
    if (!window.confirm('Promote this user to Admin? They will receive full moderation capabilities.')) return;

    setActionUserId(userId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/promote`, { method: 'POST' });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || 'Promotion failed.');
      } else {
        await fetchUsers();
      }
    } catch {
      setError('Network error during promotion.');
    } finally {
      setActionUserId(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase().trim())
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-muted flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading user directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text font-heading flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>User Management</span>
          </h1>
          <p className="text-sm text-neutral-muted mt-1">
            Manage registered student accounts, restrict banned users, and manage admin permissions.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-md border border-border bg-white focus:outline-none focus:ring-1 focus:ring-primary min-h-[38px]"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border text-xs font-semibold text-neutral-muted uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-neutral-muted">
                    No users found matching &ldquo;{search}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                    <td className="p-4 font-medium text-neutral-text">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {item.full_name[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-text">{item.full_name}</div>
                          <div className="text-xs text-neutral-muted">Joined {new Date(item.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {item.is_admin ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-muted">Student User</span>
                      )}
                    </td>

                    <td className="p-4">
                      {item.is_banned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-danger/10 text-danger border border-danger/20">
                          <UserX className="w-3.5 h-3.5" />
                          <span>Banned</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-surface border border-border text-neutral-text">
                          <UserCheck className="w-3.5 h-3.5 text-primary" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!item.is_admin && (
                          <button
                            type="button"
                            disabled={actionUserId === item.id}
                            onClick={() => handlePromote(item.id)}
                            className="px-2.5 py-1 bg-surface hover:bg-border text-neutral-text border border-border text-xs font-medium rounded transition-colors min-h-[32px] flex items-center gap-1"
                          >
                            <Shield className="w-3 h-3 text-primary" />
                            <span>Promote</span>
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={actionUserId === item.id}
                          onClick={() => handleBanToggle(item.id, item.is_banned)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors min-h-[32px] flex items-center gap-1 ${
                            item.is_banned
                              ? 'bg-primary text-white hover:bg-primary-hover'
                              : 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20'
                          }`}
                        >
                          {actionUserId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : item.is_banned ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Unban</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3" />
                              <span>Ban User</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
