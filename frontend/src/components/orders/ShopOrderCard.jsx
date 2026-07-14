import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import StatusBadge from '../common/StatusBadge';
import { orderApi } from '../../api/order.api';

const NEXT_ACTIONS = {
  pending: [{ label: 'Accept', status: 'accepted' }, { label: 'Reject', status: 'rejected' }],
  accepted: [{ label: 'Dispatch', status: 'dispatched' }],
  dispatched: [{ label: 'Mark Delivered', status: 'delivered' }],
};

const ShopOrderCard = ({ order }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status) => orderApi.updateStatus(order._id, { status }),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not update order'),
  });

  const handleInvoiceDownload = async () => {
    try {
      const { data } = await orderApi.downloadInvoice(order._id);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${order.orderNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Could not download invoice');
    }
  };

  const actions = NEXT_ACTIONS[order.status] || [];

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-ink-900">{order.orderNumber}</p>
          <p className="text-sm text-ink-500">{order.customer?.name} · {order.customer?.phone}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-4 space-y-1 text-sm text-ink-700">
        {order.items.map((item) => (
          <div key={item.medicine} className="flex justify-between">
            <span>{item.name} × {item.quantity}</span>
            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="font-semibold">₹{order.total.toFixed(2)}</span>
        <div className="flex gap-2">
          <button onClick={handleInvoiceDownload} className="btn-secondary text-sm">🧾 Invoice</button>
          {actions.map((a) => (
            <button
              key={a.status}
              onClick={() => mutation.mutate(a.status)}
              disabled={mutation.isPending}
              className={a.status === 'rejected' ? 'btn-secondary text-sm' : 'btn-primary text-sm'}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopOrderCard;
