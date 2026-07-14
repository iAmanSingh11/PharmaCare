import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { medicineApi } from '../../api/medicine.api';
import { userApi } from '../../api/user.api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import { SkeletonCard } from '../../components/common/Skeleton';

const CATEGORIES = ['All', 'Pain Relief', 'Fever', 'Cold & Flu', 'Vitamins & Supplements', 'Antibiotics', 'Diabetes Care'];

const CustomerSearchPage = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const { addItem } = useCart();
  const { user, setUser } = useAuth();
  const { items: recentlyViewed, trackView } = useRecentlyViewed();
  const debounceRef = useRef(null);
  const queryClient = useQueryClient();

  // Debounce free-text typing before it hits the search query / suggestions
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const { data: suggestions } = useQuery({
    queryKey: ['medicine-suggestions', searchInput],
    queryFn: () => medicineApi.list({ search: searchInput, limit: 5 }).then((r) => r.data.data),
    enabled: searchInput.length >= 2 && showSuggestions,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['medicines', { search, category, sort, page }],
    queryFn: () =>
      medicineApi
        .list({ search, sort, page, limit: 12, ...(category !== 'All' && { category }) })
        .then((r) => r.data),
  });

  const wishlistMutation = useMutation({
    mutationFn: (medicineId) => userApi.toggleWishlist(medicineId),
    onSuccess: (res, medicineId) => {
      setUser((prev) => ({ ...prev, wishlist: res.data.data }));
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(res.data.wishlisted ? 'Added to wishlist' : 'Removed from wishlist');
    },
    onError: () => toast.error('Could not update wishlist'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Find Medicines</h1>
        <p className="text-sm text-ink-500">Search by name, brand, generic name, or category</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search medicines…"
            className="input-field"
          />
          {showSuggestions && searchInput.length >= 2 && suggestions?.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-soft">
              {suggestions.map((s) => (
                <button
                  key={s._id}
                  onMouseDown={() => { setSearchInput(s.name); setSearch(s.name); setPage(1); }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {s.name} <span className="text-xs text-ink-500">· {s.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field w-auto">
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-auto">
          <option value="-createdAt">Newest</option>
          <option value="sellingPrice">Price: Low to High</option>
          <option value="-sellingPrice">Price: High to Low</option>
        </select>
      </div>

      {recentlyViewed.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-ink-700">Recently Viewed</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentlyViewed.map((med) => (
              <button
                key={med._id}
                onClick={() => { setSearchInput(med.name); setSearch(med.name); setPage(1); }}
                className="min-w-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:border-brand-300"
              >
                <p className="truncate font-medium text-ink-900">{med.name}</p>
                <p className="text-ink-500">₹{med.sellingPrice}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : data?.data?.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((med) => {
              const isWishlisted = user?.wishlist?.some((id) => id === med._id || id?._id === med._id);
              return (
                <div key={med._id} className="card" onMouseEnter={() => trackView(med)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/customer/medicine/${med._id}`} className="font-semibold text-ink-900 hover:text-brand-500">
                        {med.name}
                      </Link>
                      <p className="text-xs text-ink-500">{med.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {med.discountPercent > 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {med.discountPercent}% off
                        </span>
                      )}
                      <button
                        onClick={() => wishlistMutation.mutate(med._id)}
                        title="Save to wishlist"
                        className={isWishlisted ? 'text-rose-500' : 'text-ink-300 hover:text-rose-400'}
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                  <StarRating value={med.ratingsAverage} count={med.ratingsCount} />
                  <p className="mt-2 text-sm text-ink-500">
                    {med.chemist?.shopDetails?.shopName || med.chemist?.name}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-ink-900">₹{med.sellingPrice}</span>
                    {med.mrp > med.sellingPrice && (
                      <span className="text-xs text-ink-500 line-through">₹{med.mrp}</span>
                    )}
                  </div>
                  <button
                    onClick={() => { addItem(med, 1); toast.success(`${med.name} added to cart`); }}
                    className="btn-primary mt-4 w-full text-sm"
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              );
            })}
          </div>
          <Pagination page={data.pagination.page} limit={data.pagination.limit} total={data.pagination.total} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState icon="🔎" title="No medicines found" description="Try a different search term or category." />
      )}
    </div>
  );
};

export default CustomerSearchPage;
