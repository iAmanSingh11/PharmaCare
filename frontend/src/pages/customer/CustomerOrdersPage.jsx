import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order.api';
import CustomerOrderCard from '../../components/orders/CustomerOrderCard';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { SkeletonCard } from '../../components/common/Skeleton';

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'dispatched', 'delivered', 'cancelled'];

const CustomerOrdersPage = () => {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', { status, page }],
    queryFn: () =>
      orderApi.mine({ page, limit: 10, ...(status !== 'all' && { status }) }).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My Orders</h1>
        <p className="text-sm text-ink-500">Track current and past orders</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ${
              status === s ? 'bg-brand-500 text-white' : 'bg-white text-ink-700 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard /><SkeletonCard />
        </div>
      ) : data?.data?.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {data.data.map((order) => <CustomerOrderCard key={order._id} order={order} />)}
          </div>
          <Pagination page={data.pagination.page} limit={data.pagination.limit} total={data.pagination.total} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState icon="📦" title="No orders yet" description="Orders you place will show up here with live status updates." />
      )}
    </div>
  );
};

export default CustomerOrdersPage;
