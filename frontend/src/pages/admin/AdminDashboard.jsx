import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import StatCard from '../../components/dashboard/StatCard';
import { SkeletonCard } from '../../components/common/Skeleton';

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminApi.overview().then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-slate-100">Platform Overview</h1>
        <p className="text-sm text-ink-500">A bird's-eye view of PharmaCare</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon="👤" label="Customers" value={data.totalCustomers} accent="brand" />
          <StatCard icon="🏬" label="Chemists" value={data.totalChemists} accent="emerald" />
          <StatCard icon="📦" label="Total Orders" value={data.totalOrders} accent="brand" />
          <StatCard icon="💊" label="Medicines Listed" value={data.totalMedicines} accent="brand" />
          <StatCard icon="⏳" label="Pending Verifications" value={data.pendingVerifications} accent="amber" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
