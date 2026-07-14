import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reviewApi } from '../../api/review.api';
import StarRating from '../common/StarRating';

const ReviewModal = ({ order, onClose }) => {
  const [medicineId, setMedicineId] = useState(order.items[0]?.medicine || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => reviewApi.create({ orderId: order._id, medicineId, rating, comment }),
    onSuccess: () => {
      toast.success('Thanks for your feedback!');
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not submit review'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Rate your order</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900">✕</button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Which item?</label>
            <select value={medicineId} onChange={(e) => setMedicineId(e.target.value)} className="input-field">
              {order.items.map((item) => (
                <option key={item.medicine} value={item.medicine}>{item.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Your rating</label>
            <StarRating value={rating} interactive size="text-2xl" onChange={setRating} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="How was the product and delivery?"
            />
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="btn-primary w-full"
          >
            {mutation.isPending ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
