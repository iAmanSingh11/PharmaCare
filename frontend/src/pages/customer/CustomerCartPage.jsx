import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/order.api';
import { paymentApi } from '../../api/payment.api';
import { useRazorpay } from '../../hooks/useRazorpay';
import EmptyState from '../../components/common/EmptyState';

const CustomerCartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { open: openRazorpay, isLoading: razorpayLoading } = useRazorpay();
  const [addressId, setAddressId] = useState(user?.addresses?.[0]?._id || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);

  // Tells us whether Razorpay keys are configured server-side, so we can
  // hide/disable online payment cleanly instead of failing at checkout.
  const { data: paymentConfig } = useQuery({
    queryKey: ['payment-config'],
    queryFn: () => paymentApi.config().then((r) => r.data.data),
    staleTime: Infinity,
  });

  const placeOrderMutation = useMutation({
    mutationFn: (payload) => orderApi.place(payload),
    onSuccess: () => {
      toast.success('Order placed successfully!');
      clearCart();
      navigate('/customer/orders');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not place order'),
  });

  const buildAddressPayload = () => {
    const address = user?.addresses?.find((a) => a._id === addressId);
    if (!address) return null;
    return {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };
  };

  const handleCheckout = async () => {
    const deliveryAddress = buildAddressPayload();
    if (!deliveryAddress) {
      toast.error('Please add a delivery address in your profile first');
      return;
    }

    const basePayload = {
      items: items.map((i) => ({ medicineId: i.medicine._id, quantity: i.quantity })),
      deliveryAddress,
    };

    if (paymentMethod === 'cod') {
      placeOrderMutation.mutate({ ...basePayload, paymentMethod: 'cod' });
      return;
    }

    // Online payment: create a Razorpay order first, open Checkout, then
    // only place our order once Razorpay hands back a verifiable payment.
    try {
      setIsProcessing(true);
      const { data } = await paymentApi.createRazorpayOrder(total);
      const result = await openRazorpay({
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        keyId: data.keyId,
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      });

      placeOrderMutation.mutate({
        ...basePayload,
        paymentMethod: 'razorpay',
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });
    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        toast.error(err.response?.data?.message || err.message || 'Payment could not be completed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isBusy = placeOrderMutation.isPending || razorpayLoading || isProcessing;
  const onlinePaymentAvailable = paymentConfig?.configured;

  if (!items.length) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        description="Browse medicines and add items to get started."
        action={<button onClick={() => navigate('/customer/search')} className="btn-primary">Find Medicines</button>}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <h1 className="text-2xl font-bold text-ink-900">Your Cart</h1>
        {items.map((item) => (
          <div key={item.medicine._id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium text-ink-900">{item.medicine.name}</p>
              <p className="text-sm text-ink-500">₹{item.medicine.sellingPrice} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQuantity(item.medicine._id, item.quantity - 1)} className="btn-secondary h-8 w-8 p-0 text-sm">−</button>
              <span className="w-6 text-center">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.medicine._id, item.quantity + 1)} className="btn-secondary h-8 w-8 p-0 text-sm">+</button>
              <button onClick={() => removeItem(item.medicine._id)} className="ml-3 text-rose-500">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card h-fit space-y-5">
        <h2 className="font-semibold text-ink-900">Order Summary</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Delivery Address</label>
          {user?.addresses?.length ? (
            <select value={addressId} onChange={(e) => setAddressId(e.target.value)} className="input-field">
              {user.addresses.map((a) => (
                <option key={a._id} value={a._id}>{a.label} — {a.line1}, {a.city}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-ink-500">
              No saved address.{' '}
              <button onClick={() => navigate('/customer/profile')} className="font-medium text-brand-500">Add one</button>
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Payment Method</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              💵 Cash on Delivery
            </label>
            <label
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                onlinePaymentAvailable
                  ? 'border-slate-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50'
                  : 'cursor-not-allowed border-slate-100 opacity-50'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                disabled={!onlinePaymentAvailable}
                checked={paymentMethod === 'razorpay'}
                onChange={() => setPaymentMethod('razorpay')}
              />
              💳 Pay Online (Card / UPI / Netbanking)
              {!onlinePaymentAvailable && <span className="ml-auto text-xs text-ink-500">Unavailable</span>}
            </label>
          </div>
          {!onlinePaymentAvailable && (
            <p className="mt-1 text-xs text-ink-500">
              Online payments open up once the site owner adds Razorpay keys.
            </p>
          )}
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
        </div>

        <button onClick={handleCheckout} disabled={isBusy} className="btn-primary w-full">
          {isBusy
            ? 'Processing…'
            : paymentMethod === 'cod'
              ? 'Place Order (COD)'
              : `Pay ₹${total.toFixed(2)}`}
        </button>

        <p className="text-center text-[11px] text-ink-400">
          🔒 Payments are processed securely via Razorpay. PharmaCare never sees your card details.
        </p>
      </div>
    </div>
  );
};

export default CustomerCartPage;
