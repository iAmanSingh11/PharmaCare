import api from './axiosInstance';

export const aiApi = {
  chat: (message, history) => api.post('/ai/chat', { message, history }),
};
