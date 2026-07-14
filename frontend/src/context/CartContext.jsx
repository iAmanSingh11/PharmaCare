import { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);

/*
 * Cart lives in memory on the client and is submitted directly as an order.
 */
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]); // [{ medicine, quantity }]

  const addItem = (medicine, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.medicine._id === medicine._id);
      if (existing) {
        return prev.map((i) =>
          i.medicine._id === medicine._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { medicine, quantity }];
    });
  };

  const updateQuantity = (medicineId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.medicine._id !== medicineId)
        : prev.map((i) => (i.medicine._id === medicineId ? { ...i, quantity } : i))
    );
  };

  const removeItem = (medicineId) => setItems((prev) => prev.filter((i) => i.medicine._id !== medicineId));
  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.medicine.sellingPrice * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
