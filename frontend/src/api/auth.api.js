import api from './axiosInstance';

export const authApi = {
  registerCustomer: (payload) => api.post('/auth/register/customer', payload),
  registerChemist: (payload) => api.post('/auth/register/chemist', payload),
  verifyEmail: (payload) => api.post('/auth/verify-email', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
};
