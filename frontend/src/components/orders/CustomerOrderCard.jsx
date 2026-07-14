import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatusBadge from '../common/StatusBadge';
import OrderTimeline from './OrderTimeline';
import ReviewModal from './ReviewModal';
import { orderApi } from '../../api/order.api';
import { reviewApi } from '../../api/review.api';
import { useCart } from '../../context/CartContext';

const CustomerOrderCard = ({ order }) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const { data: reviewable } = useQuery({
    queryKey: ['reviewable', order._id],
    queryFn: () => reviewApi.reviewable(order._id).then((r) => r.data.data),
    enabled: order.status === 'delivered',
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancel(order._id),
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not cancel order'),
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

  const handleReorder = () => {
    order.items.forEach((item) => {
      // Re adds using the price snapshot from this order; the cart page
      // always checks current stock at checkout time.
      addItem({ _id: item.medicine, name: item.name, sellingPrice: item.price }, item.quantity);
    });
    toast.success('Items added to cart');
    navigate('/customer/cart');
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-ink-900">{order.orderNumber}</p>
          <p className="text-sm text-ink-500">{order.chemist?.shopDetails?.shopName || order.chemist?.name}</p>
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
        <span className="text-ink-500">{new Date(order.createdAt).toLocaleDateString()}</span>
        <span className="font-semibold">₹{order.total.toFixed(2)}</span>
      </div>

      <button
        onClick={() => setShowTimeline((s) => !s)}
        className="mt-3 text-xs font-medium text-brand-500"
      >
        {showTimeline ? 'Hide' : 'Track'} order status
      </button>
      {showTimeline && (
        <div className="mt-3">
          <OrderTimeline timeline={order.timeline} status={order.status} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="btn-secondary text-xs"
          >
            Cancel Order
          </button>
        )}
        <button onClick={handleReorder} className="btn-secondary text-xs">↻ Reorder</button>
        <button onClick={handleInvoiceDownload} className="btn-secondary text-xs">🧾 Invoice</button>
        {order.status === 'delivered' && !reviewable?.alreadyReviewed && (
          <button onClick={() => setShowReview(true)} className="btn-primary text-xs">⭐ Leave a Review</button>
        )}
      </div>

      {showReview && <ReviewModal order={order} onClose={() => setShowReview(false)} />}
    </div>
  );
};

export default CustomerOrderCard;
