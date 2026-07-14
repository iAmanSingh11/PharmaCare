import api from './axiosInstance';

export const medicineApi = {
  list: (params) => api.get('/medicines', { params }),
  getById: (id) => api.get(`/medicines/${id}`),
  myInventory: (params) => api.get('/medicines/inventory/mine', { params }),
  summary: () => api.get('/medicines/analytics/summary'),
  create: (formData) =>
    api.post('/medicines', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.patch(`/medicines/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/medicines/${id}`),
};
