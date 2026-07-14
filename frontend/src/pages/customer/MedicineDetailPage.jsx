import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { medicineApi } from '../../api/medicine.api';
import { reviewApi } from '../../api/review.api';
import { userApi } from '../../api/user.api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import StarRating from '../../components/common/StarRating';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

const MedicineDetailPage = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();
  const { user, setUser } = useAuth();
  const { trackView } = useRecentlyViewed();
  const queryClient = useQueryClient();

  const { data: medicine, isLoading } = useQuery({
    queryKey: ['medicine', id],
    queryFn: () => medicineApi.getById(id).then((r) => r.data.data),
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', 'medicine', id],
    queryFn: () => reviewApi.byMedicine(id).then((r) => r.data.data),
  });

  useEffect(() => {
    if (medicine) trackView(medicine);
  }, [medicine, trackView]);

  const wishlistMutation = useMutation({
    mutationFn: () => userApi.toggleWishlist(id),
    onSuccess: (res) => {
      setUser((prev) => ({ ...prev, wishlist: res.data.data }));
      toast.success(res.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    },
  });

  if (isLoading) return <Spinner fullScreen />;
  if (!medicine) return <EmptyState icon="💊" title="Medicine not found" />;

  const isWishlisted = user?.wishlist?.some((w) => w === id || w?._id === id);
  const isExpired = new Date(medicine.expiryDate) < new Date();
  const isOutOfStock = medicine.stockQuantity === 0;

  return (
    <div className="space-y-8">
      <Link to="/customer/search" className="text-sm font-medium text-brand-500">← Back to search</Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-white shadow-soft">
            {medicine.images?.length ? (
              <img src={medicine.images[activeImage]?.url} alt={medicine.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-6xl">💊</span>
            )}
          </div>
          {medicine.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {medicine.images.map((img, i) => (
                <button
                  key={img.publicId || i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    i === activeImage ? 'border-brand-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{medicine.category}</span>
          <h1 className="mt-3 text-2xl font-bold text-ink-900">{medicine.name}</h1>
          {medicine.genericName && <p className="text-sm text-ink-500">Generic: {medicine.genericName}</p>}

          <div className="mt-2">
            <StarRating value={medicine.ratingsAverage} count={medicine.ratingsCount} size="text-base" />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-ink-900">₹{medicine.sellingPrice}</span>
            {medicine.mrp > medicine.sellingPrice && (
              <span className="text-ink-500 line-through">₹{medicine.mrp}</span>
            )}
            {medicine.discountPercent > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {medicine.discountPercent}% off
              </span>
            )}
          </div>

          <p className="mt-4 text-sm text-ink-700">{medicine.description || 'No description provided.'}</p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
            <p><strong>Sold by:</strong> {medicine.chemist?.shopDetails?.shopName || medicine.chemist?.name}</p>
            <p className="mt-1">
              <strong>Availability:</strong>{' '}
              {isOutOfStock ? (
                <span className="text-rose-600">Out of stock</span>
              ) : isExpired ? (
                <span className="text-rose-600">Expired</span>
              ) : (
                <span className="text-emerald-600">{medicine.stockQuantity} in stock</span>
              )}
            </p>
            {medicine.requiresPrescription && (
              <p className="mt-1 text-amber-600">⚠️ Requires a valid prescription at delivery</p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="btn-secondary h-9 w-9 p-0">−</button>
              <span className="w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="btn-secondary h-9 w-9 p-0">+</button>
            </div>
            <button
              onClick={() => { addItem(medicine, quantity); toast.success(`${medicine.name} added to cart`); }}
              disabled={isOutOfStock || isExpired}
              className="btn-primary flex-1"
            >
              🛒 Add to Cart
            </button>
            <button
              onClick={() => wishlistMutation.mutate()}
              className={`btn-secondary h-11 w-11 p-0 text-lg ${isWishlisted ? 'text-rose-500' : ''}`}
            >
              ♥
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Customer Reviews</h2>
        {reviews?.length ? (
          <div className="mt-4 space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="card">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink-900">{r.customer?.name || 'Anonymous'}</p>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-ink-700">{r.comment}</p>}
                <p className="mt-2 text-xs text-ink-500">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-500">No reviews yet. Be the first to leave one after your order is delivered.</p>
        )}
      </div>
    </div>
  );
};

export default MedicineDetailPage;
