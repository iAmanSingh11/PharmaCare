import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'pharmacare_recently_viewed';
const MAX_ITEMS = 8;

/*
 * Tracks recently viewed medicines in localStorage, scoped to this browser.
 * Stores lightweight snapshots (id/name/price/category) so the "Recently
 * Viewed" rail doesn't need an extra API round trip.
 */
export const useRecentlyViewed = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);

  const trackView = useCallback((medicine) => {
    setItems((prev) => {
      const next = [
        { _id: medicine._id, name: medicine.name, sellingPrice: medicine.sellingPrice, category: medicine.category },
        ...prev.filter((i) => i._id !== medicine._id),
      ].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { items, trackView };
};
