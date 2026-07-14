import api from './axiosInstance';

export const orderApi = {
  place: (payload) => api.post('/orders', payload),
  mine: (params) => api.get('/orders/mine', { params }),
  shop: (params) => api.get('/orders/shop', { params }),
  customers: () => api.get('/orders/customers'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, payload) => api.patch(`/orders/${id}/status`, payload),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
  downloadInvoice: (id) => api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),
};
