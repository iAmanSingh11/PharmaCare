import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin.api';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonRow } from '../../components/common/Skeleton';

const AdminUsersPage = () => {
  const [role, setRole] = useState('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', role],
    queryFn: () => adminApi.users({ limit: 50, ...(role !== 'all' && { role }) }).then((r) => r.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => adminApi.verifyChemist(id),
    onSuccess: () => {
      toast.success('Chemist verified');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id) => adminApi.toggleActive(id),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-slate-100">Users & Chemists</h1>
        <p className="text-sm text-ink-500">Verify pharmacies and manage account access</p>
      </div>

      <div className="flex gap-2">
        {['all', 'customer', 'chemist'].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${
              role === r ? 'bg-brand-500 text-white' : 'bg-white text-ink-700 hover:bg-slate-50'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-white shadow-soft">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="grid grid-cols-5 gap-4 bg-brand-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-700">
            <span className="col-span-2">Name</span>
            <span>Role</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {data?.data?.map((u) => (
            <div key={u._id} className="grid grid-cols-5 items-center gap-4 border-b border-slate-100 px-4 py-3 text-sm">
              <div className="col-span-2">
                <p className="font-medium text-ink-900">{u.name}</p>
                <p className="text-xs text-ink-500">{u.email}</p>
              </div>
              <span className="capitalize">{u.role}</span>
              <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
              <div className="flex gap-2">
                {u.role === 'chemist' && !u.shopDetails?.isVerified && (
                  <button onClick={() => verifyMutation.mutate(u._id)} className="btn-secondary text-xs">Verify</button>
                )}
                <button onClick={() => toggleActiveMutation.mutate(u._id)} className="btn-secondary text-xs">
                  {u.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
