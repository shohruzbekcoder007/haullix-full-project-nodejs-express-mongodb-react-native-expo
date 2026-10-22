import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Server manzili (VPS Nginx reverse proxy orqali)
const API_BASE_URL = 'http://169.58.77.15/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, code) => api.post('/auth/verify-otp', { phone, code }),
  saveProfile: (data) => api.post('/auth/save-profile', data),
};

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const matchingAPI = {
  getReturnLoads: (params) => api.get('/matching/return-loads', { params }),
};

export const finesAPI = {
  checkFines: (plateNumber) => api.get('/fines/check', { params: { plateNumber } }),
  getRadars: () => api.get('/fines/radars'),
};

export default api;
