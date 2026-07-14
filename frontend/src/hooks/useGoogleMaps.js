import { useEffect, useState } from 'react';

let loadingPromise = null;

/*
 * Loads the Google Maps JS API script exactly once and reports readiness.
 */
export const useGoogleMaps = () => {
  const [loaded, setLoaded] = useState(Boolean(window.google?.maps));
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || loaded) return;

    if (!loadingPromise) {
      loadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    loadingPromise.then(() => setLoaded(true)).catch(() => setLoaded(false));
  }, [apiKey, loaded]);

  return { loaded, apiKey };
};
