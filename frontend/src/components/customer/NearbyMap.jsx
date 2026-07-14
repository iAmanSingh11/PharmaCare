import { useEffect, useRef } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

/*
 * Renders an interactive Google Map with a marker for the customer's
 * position and one per nearby shop.
 */
const NearbyMap = ({ coords, shops }) => {
  const { loaded, apiKey } = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!loaded || !mapRef.current || !coords) return;

    const center = { lat: coords.lat, lng: coords.lng };

    if (!mapInstance.current) {
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
      });
    } else {
      mapInstance.current.setCenter(center);
    }

    new window.google.maps.Marker({
      position: center,
      map: mapInstance.current,
      title: 'You are here',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#1e66f5',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    });

    shops
      ?.filter((s) => s.shopDetails?.shopAddress?.lat && s.shopDetails?.shopAddress?.lng)
      .forEach((shop) => {
        const marker = new window.google.maps.Marker({
          position: { lat: shop.shopDetails.shopAddress.lat, lng: shop.shopDetails.shopAddress.lng },
          map: mapInstance.current,
          title: shop.shopDetails.shopName || shop.name,
        });

        const info = new window.google.maps.InfoWindow({
          content: `<strong>${shop.shopDetails.shopName || shop.name}</strong><br/>${shop.shopDetails.shopAddress.line1 || ''}`,
        });
        marker.addListener('click', () => info.open(mapInstance.current, marker));
      });
  }, [loaded, coords, shops]);

  if (!apiKey) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
        <p className="text-sm text-ink-500">
          Embedded map will appear here once <code className="rounded bg-slate-100 px-1.5 py-0.5">VITE_GOOGLE_MAPS_API_KEY</code> is set in <code className="rounded bg-slate-100 px-1.5 py-0.5">.env</code>.
        </p>
      </div>
    );
  }

  if (!loaded) {
    return <div className="flex h-64 items-center justify-center rounded-2xl bg-white text-sm text-ink-500">Loading map…</div>;
  }

  return <div ref={mapRef} className="h-64 w-full rounded-2xl shadow-soft md:h-80" />;
};

export default NearbyMap;
