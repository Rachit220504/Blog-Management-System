import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => (await usersApi.list({ page, limit: 10, search })).data,
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }) => usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Role updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Role update failed'),
  });

  const statusMutation = useMutation({
    mutationFn: async (id) => usersApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Status updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Status update failed'),
  });

  const users = data?.data || [];
  const pagination = data?.pagination || { pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="RBAC" title="Users Management" description="Super admins can update roles and account status with live permissions." />

      <Card className="p-4">
        <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search users by name or email" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="min-w-full divide-y divide-white/10 text-left">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.22em] text-slate-500">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((item) => {
                const isSelf = item._id === currentUser?._id;
                return (
                  <tr key={item._id} className="transition hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`} alt={item.name} className="h-11 w-11 rounded-2xl border border-white/10 object-cover" />
                        <div>
                          <p className="font-medium text-white">{item.name} {isSelf && <span className="ml-2 text-xs text-sky-300">YOU</span>}</p>
                          <p className="text-sm text-slate-400">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select value={item.role} disabled={isSelf || roleMutation.isPending} onChange={(event) => roleMutation.mutate({ id: item._id, role: event.target.value })} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none disabled:opacity-50">
                        <option value="super_admin">Super Admin</option>
                        <option value="editor">Editor</option>
                        <option value="author">Author</option>
                        <option value="user">User</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={item.isActive ? 'success' : 'danger'}>{item.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{formatDate(item.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <button disabled={isSelf || statusMutation.isPending} onClick={() => statusMutation.mutate(item._id)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:bg-white/10 disabled:opacity-50">
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Page {page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white disabled:opacity-40">Prev</button>
            <button disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white disabled:opacity-40">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserList;
