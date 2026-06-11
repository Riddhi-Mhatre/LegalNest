import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, { refreshToken });
          const newTokens = response.data.data;
          
          if (newTokens?.IdToken) {
             setTokens(newTokens.IdToken);
             originalRequest.headers.Authorization = `Bearer ${newTokens.IdToken}`;
             return api(originalRequest);
          }
        } catch (refreshErr) {
          logout();
        }
      } else {
        logout();
      }
    } else if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);
