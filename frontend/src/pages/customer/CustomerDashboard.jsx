import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/order.api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/dashboard/StatCard';
import CustomerOrderCard from '../../components/orders/CustomerOrderCard';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', { limit: 4 }],
    queryFn: () => orderApi.mine({ limit: 4, sort: '-createdAt' }).then((r) => r.data),
  });

  const activeOrders = data?.data?.filter((o) => !['delivered', 'cancelled', 'rejected'].includes(o.status)).length ?? 0;
  const totalOrders = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-ink-500">Here's a quick look at your account</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon="📦" label="Active Orders" value={activeOrders} accent="brand" />
        <StatCard icon="🧾" label="Total Orders" value={totalOrders} accent="emerald" />
        <StatCard icon="📍" label="Saved Addresses" value={user?.addresses?.length ?? 0} accent="amber" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/customer/search" className="btn-primary">🔎 Find Medicines</Link>
        <Link to="/customer/nearby" className="btn-secondary">📍 Nearby Pharmacies</Link>
      </div>

      <div>
        <h2 className="mb-4 font-semibold text-ink-900">Recent Orders</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <SkeletonCard /><SkeletonCard />
          </div>
        ) : data?.data?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.data.map((order) => <CustomerOrderCard key={order._id} order={order} />)}
          </div>
        ) : (
          <EmptyState icon="📦" title="No orders yet" description="Your recent orders will appear here." />
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
