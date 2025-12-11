import axios from 'axios';

// Lấy Host URL
const HOST_API_URL = 'http://localhost:5001';

// Tạo Axios instance
const api = axios.create({
  baseURL: HOST_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  // Thêm withCredentials nếu cần xử lý cookie/session
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;