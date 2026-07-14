import api from './axiosInstance';

export const paymentApi = {
  config: () => api.get('/payments/config'),
  createRazorpayOrder: (amount) => api.post('/payments/razorpay/order', { amount }),
};
