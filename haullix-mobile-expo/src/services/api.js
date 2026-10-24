import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Server manzili (VPS Nginx reverse proxy orqali).
// Mahalliy sinov uchun: EXPO_PUBLIC_API_URL=http://<kompyuter-IP>:5000/api npx expo start
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://169.58.77.15/api';

export const TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

// Barcha so'rovlar to'g'ridan-to'g'ri javob tanasini (res.data) qaytaradi
const data = (promise) => promise.then((res) => res.data);

// Server yoki tarmoq xatosidan foydalanuvchiga ko'rsatiladigan matn
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'Server javob bermadi. Qaytadan urinib ko\'ring';
  if (!error?.response) return 'Internet aloqasini tekshiring';
  return 'Xatolik yuz berdi. Qaytadan urinib ko\'ring';
};

// Auth API
export const authAPI = {
  sendOtp: (phone) => data(api.post('/auth/send-otp', { phone })),
  verifyOtp: (phone, code) => data(api.post('/auth/verify-otp', { phone, code })),
  saveProfile: (profile) => data(api.post('/auth/save-profile', profile)),
  getProfile: () => data(api.get('/auth/profile')),
  switchRole: (role) => data(api.post('/auth/switch-role', { role })),
  uploadAvatar: (base64) => data(api.post('/auth/avatar', { image: base64 }, { timeout: 30000 })),
  deleteAvatar: () => data(api.delete('/auth/avatar')),
};

// Foydalanuvchi rasmi manzili. version (avatarUpdatedAt) o'zgarsa, kesh yangilanadi
export const avatarUrl = (userId, version) =>
  userId ? `${API_BASE_URL}/auth/avatar/${userId}${version ? `?v=${new Date(version).getTime()}` : ''}` : null;

// Orders API
export const ordersAPI = {
  getOrders: (params) => data(api.get('/orders', { params })),
  getOrder: (id) => data(api.get(`/orders/${id}`)),
  createOrder: (order) => data(api.post('/orders', order)),
  update: (id, order) => data(api.put(`/orders/${id}`, order)),
  cancel: (id) => data(api.put(`/orders/${id}`, { status: 'cancelled' })),
  delete: (id) => data(api.delete(`/orders/${id}`)),
  getActiveTracking: () => data(api.get('/orders/active-tracking')),
  accept: (id) => data(api.post(`/orders/${id}/accept`)),
  complete: (id) => data(api.post(`/orders/${id}/complete`)),
  reviewDriver: (id, review) => data(api.post(`/orders/${id}/review`, review)),
};

// Matching API
export const matchingAPI = {
  getReturnLoads: (params) => data(api.get('/matching/return-loads', { params })),
};

// Fines API
export const finesAPI = {
  checkFines: (plateNumber) => api.get('/fines/check', { params: { plateNumber } }),
  getRadars: () => api.get('/fines/radars'),
};

export default api;
