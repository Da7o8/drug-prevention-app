// src/services/api.ts
import axios from 'axios';

const HOST_API_URL = 'http://localhost:5001';

const api = axios.create({
  baseURL: HOST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động thêm token vào mọi request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('authData');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch (error) {
      console.error('Lỗi parse authData:', error);
    }
  }
  return config;
});

// Xử lý lỗi 401 (token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;