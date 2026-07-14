import { useQuery } from '@tanstack/react-query';
import { medicineApi } from '../../api/medicine.api';
import { orderApi } from '../../api/order.api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import AlertsPanel from '../../components/dashboard/AlertsPanel';
import WeeklySalesChart from '../../components/dashboard/WeeklySalesChart';
import { SkeletonCard } from '../../components/common/Skeleton';

const ChemistDashboard = () => {
  const { user } = useAuth();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => medicineApi.summary().then((r) => r.data.data),
  });

  const { data: orders } = useQuery({
    queryKey: ['shop-orders', { limit: 100 }],
    queryFn: () => orderApi.shop({ limit: 100 }).then((r) => r.data.data),
  });

  const revenue = orders
    ?.filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const weeklyData = orders
    ? Object.values(
        orders.reduce((acc, o) => {
          const day = new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
          acc[day] = acc[day] || { day, revenue: 0 };
          acc[day].revenue += o.status === 'delivered' ? o.total : 0;
          return acc;
        }, {})
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">
          Welcome back, {user?.shopDetails?.shopName || user?.name}
        </h1>
        <p className="text-sm text-ink-500">Here's what's happening with your pharmacy today.</p>
      </div>

      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon="💰" label="Total Revenue" value={`₹${(revenue || 0).toFixed(2)}`} accent="emerald" />
          <StatCard icon="⚠️" label="Low Stock Items" value={summary?.lowStock ?? 0} accent="amber" />
          <StatCard icon="⏳" label="Expired Medicines" value={summary?.expired ?? 0} accent="rose" />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <WeeklySalesChart data={weeklyData} />
        </div>
        <AlertsPanel
          expired={summary?.expired ?? 0}
          lowStock={summary?.lowStock ?? 0}
          outOfStock={summary?.outOfStock ?? 0}
        />
      </div>
    </div>
  );
};

export default ChemistDashboard;
