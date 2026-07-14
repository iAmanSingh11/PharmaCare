import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userApi } from '../../api/user.api';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/common/EmptyState';
import StarRating from '../../components/common/StarRating';
import { SkeletonCard } from '../../components/common/Skeleton';

const CustomerWishlistPage = () => {
  const queryClient = useQueryClient();
  const { addItem } = useCart();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => userApi.wishlist().then((r) => r.data.data),
  });

  const removeMutation = useMutation({
    mutationFn: (medicineId) => userApi.toggleWishlist(medicineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My Wishlist</h1>
        <p className="text-sm text-ink-500">Medicines you've saved for later</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((med) => (
            <div key={med._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/customer/medicine/${med._id}`} className="font-semibold text-ink-900 hover:text-brand-500">
                    {med.name}
                  </Link>
                  <p className="text-xs text-ink-500">{med.category}</p>
                </div>
                <button onClick={() => removeMutation.mutate(med._id)} className="text-rose-500">🗑️</button>
              </div>
              <StarRating value={med.ratingsAverage} count={med.ratingsCount} />
              <p className="mt-2 text-sm text-ink-500">{med.chemist?.shopDetails?.shopName || med.chemist?.name}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-bold text-ink-900">₹{med.sellingPrice}</span>
                <button
                  onClick={() => { addItem(med, 1); toast.success(`${med.name} added to cart`); }}
                  className="btn-primary text-sm"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="❤️" title="Your wishlist is empty" description="Tap the heart icon on any medicine to save it here." />
      )}
    </div>
  );
};

export default CustomerWishlistPage;
