import api from './axiosInstance';

export const userApi = {
  updateProfile: (payload) => api.patch('/users/profile', payload),
  addAddress: (payload) => api.post('/users/addresses', payload),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  nearbyChemists: (params) => api.get('/users/chemists/nearby', { params }),
  wishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (medicineId) => api.post(`/users/wishlist/${medicineId}`),
  toggleFavorite: (chemistId) => api.post(`/users/favorites/${chemistId}`),
};
