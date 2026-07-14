import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order.api';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonRow } from '../../components/common/Skeleton';

const ChemistCustomersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['shop-customers'],
    queryFn: () => orderApi.customers().then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Customers</h1>
        <p className="text-sm text-ink-500">Everyone who's ordered from your pharmacy</p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-white shadow-soft">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : data?.length ? (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="grid grid-cols-5 gap-4 bg-brand-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-700">
            <span className="col-span-2">Customer</span>
            <span>Orders</span>
            <span>Total Spent</span>
            <span>Last Order</span>
          </div>
          {data.map((c) => (
            <div key={c.customerId} className="grid grid-cols-5 items-center gap-4 border-b border-slate-100 px-4 py-3 text-sm">
              <div className="col-span-2">
                <p className="font-medium text-ink-900">{c.name}</p>
                <p className="text-xs text-ink-500">{c.phone} · {c.email}</p>
              </div>
              <span>{c.totalOrders}</span>
              <span className="font-medium">₹{c.totalSpent.toFixed(2)}</span>
              <span className="text-ink-500">{new Date(c.lastOrderAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="👥" title="No customers yet" description="Once orders start coming in, your customers will show up here." />
      )}
    </div>
  );
};

export default ChemistCustomersPage;
