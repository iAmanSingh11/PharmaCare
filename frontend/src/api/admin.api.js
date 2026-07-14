import api from './axiosInstance';

export const adminApi = {
  overview: () => api.get('/admin/overview'),
  users: (params) => api.get('/admin/users', { params }),
  verifyChemist: (id) => api.patch(`/admin/users/${id}/verify`),
  toggleActive: (id) => api.patch(`/admin/users/${id}/toggle-active`),
};
