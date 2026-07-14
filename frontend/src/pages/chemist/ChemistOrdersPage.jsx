import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order.api';
import ShopOrderCard from '../../components/orders/ShopOrderCard';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { SkeletonCard } from '../../components/common/Skeleton';

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'dispatched', 'delivered', 'rejected', 'cancelled'];

const ChemistOrdersPage = () => {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['shop-orders', { status, page }],
    queryFn: () =>
      orderApi
        .shop({ page, limit: 10, ...(status !== 'all' && { status }) })
        .then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Order Management</h1>
        <p className="text-sm text-ink-500">Track and fulfill incoming orders</p>
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
            {data.data.map((order) => <ShopOrderCard key={order._id} order={order} />)}
          </div>
          <Pagination page={data.pagination.page} limit={data.pagination.limit} total={data.pagination.total} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState icon="📦" title="No orders here" description="New orders from customers will show up in this list." />
      )}
    </div>
  );
};

export default ChemistOrdersPage;
