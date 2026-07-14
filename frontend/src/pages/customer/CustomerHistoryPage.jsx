import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/order.api';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';

/*
 * Rather than a separate "illness log" the user fills in by hand, this
   derives a real medicine intake history from delivered orders accurate
   by construction, and it updates itself as new orders come in.
 */
const CustomerHistoryPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', { status: 'delivered', limit: 50 }],
    queryFn: () => orderApi.mine({ status: 'delivered', limit: 50 }).then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Health Records</h1>
        <p className="text-sm text-ink-500">A history of medicines you've received, built from your delivered orders</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard /><SkeletonCard />
        </div>
      ) : data?.length ? (
        <div className="space-y-3">
          {data.map((order) => (
            <div key={order._id} className="card">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink-900">{new Date(order.updatedAt).toLocaleDateString()}</p>
                <span className="text-xs text-ink-500">{order.chemist?.shopDetails?.shopName || order.chemist?.name}</span>
              </div>
              <ul className="mt-2 list-inside list-disc text-sm text-ink-700">
                {order.items.map((item) => (
                  <li key={item.medicine}>{item.name} × {item.quantity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="🩺" title="No records yet" description="Delivered orders will build your medicine history here." />
      )}
    </div>
  );
};

export default CustomerHistoryPage;
