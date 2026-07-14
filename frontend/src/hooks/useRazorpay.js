import { useCallback, useState } from 'react';

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptLoadingPromise = null;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptLoadingPromise) {
    scriptLoadingPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return scriptLoadingPromise;
};

/**
 * Opens the real Razorpay Checkout modal for a given order + amount.
 * `open()` resolves with { razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * on success, or rejects if the user cancels/it fails — callers decide what
 * to do next (e.g. fall back to COD).
 */
export const useRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);

  const open = useCallback(({ orderId, amount, currency, keyId, name, email, contact }) => {
    return new Promise(async (resolve, reject) => {
      setIsLoading(true);
      const loaded = await loadRazorpayScript();
      setIsLoading(false);

      if (!loaded) {
        reject(new Error('Could not load Razorpay checkout. Check your internet connection.'));
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'PharmaCare',
        description: 'Order payment',
        order_id: orderId,
        prefill: { name, email, contact },
        theme: { color: '#1e66f5' },
        handler: (response) => {
          resolve({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      });

      rzp.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Payment failed'));
      });

      rzp.open();
    });
  }, []);

  return { open, isLoading };
};
