import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userApi } from '../../api/user.api';
import { useAuth } from '../../context/AuthContext';
import NearbyMap from '../../components/customer/NearbyMap';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';

/*
 * Uses the browser's Geolocation API for the customer's position and a
   haversine distance from the backend to sort nearby shops.
 */
const CustomerNearbyPage = () => {
  const [coords, setCoords] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Location permission denied. Showing all pharmacies instead.')
    );
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['nearby-chemists', coords],
    queryFn: () => userApi.nearbyChemists({ ...coords, radiusKm: 15 }).then((r) => r.data.data),
    enabled: coords !== null || locationError !== null,
  });

  const favoriteMutation = useMutation({
    mutationFn: (chemistId) => userApi.toggleFavorite(chemistId),
    onSuccess: (res) => {
      setUser((prev) => ({ ...prev, favoriteShops: res.data.data }));
      toast.success(res.data.favorited ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: () => toast.error('Could not update favorites'),
  });

  const isFavorite = (id) => user?.favoriteShops?.some((f) => f === id || f?._id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Nearby Pharmacies</h1>
        <p className="text-sm text-ink-500">
          {locationError || 'Sorted by distance from your current location'}
        </p>
      </div>

      {coords && <NearbyMap coords={coords} shops={data} />}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard /><SkeletonCard />
        </div>
      ) : data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((shop) => (
            <div key={shop._id} className="card">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-ink-900">{shop.shopDetails?.shopName || shop.name}</h3>
                <button
                  onClick={() => favoriteMutation.mutate(shop._id)}
                  title="Favorite this pharmacy"
                  className={isFavorite(shop._id) ? 'text-amber-400' : 'text-ink-300 hover:text-amber-300'}
                >
                  ★
                </button>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {shop.shopDetails?.shopAddress?.line1}, {shop.shopDetails?.shopAddress?.city}
              </p>
              {shop.distanceKm !== null && (
                <p className="mt-2 text-sm font-medium text-brand-600">📍 {shop.distanceKm.toFixed(1)} km away</p>
              )}
              {shop.shopDetails?.openingHours?.open && (
                <p className="mt-1 text-xs text-ink-500">
                  Open {shop.shopDetails.openingHours.open} – {shop.shopDetails.openingHours.close}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${shop.shopDetails?.shopAddress?.lat},${shop.shopDetails?.shopAddress?.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary text-sm"
                >
                  🧭 Directions
                </a>
                <a href={`tel:${shop.phone}`} className="btn-secondary text-sm">📞 Call</a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="📍" title="No pharmacies found nearby" description="Try widening your search radius." />
      )}
    </div>
  );
};

export default CustomerNearbyPage;
