import api from './axiosInstance';

export const reviewApi = {
  create: (payload) => api.post('/reviews', payload),
  byMedicine: (medicineId) => api.get(`/reviews/medicine/${medicineId}`),
  byChemist: (chemistId) => api.get(`/reviews/chemist/${chemistId}`),
  reviewable: (orderId) => api.get(`/reviews/reviewable/${orderId}`),
};
