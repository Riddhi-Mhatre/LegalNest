import { api } from './api';

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data.data);

export const register = (data: { email: string; password: string; name: string; phone?: string; role: string }) =>
  api.post('/auth/register', data).then(r => r.data.data);

export const requestOtp = (phone: string) =>
  api.post('/auth/otp/request', { phone }).then(r => r.data.data);

export const verifyOtp = (phone: string, code: string) =>
  api.post('/auth/otp/verify', { phone, code }).then(r => r.data.data);

export const verifyEmail = (email: string, code: string) =>
  api.post('/auth/verify-email', { email, code }).then(r => r.data.data);

export const refreshToken = (refreshToken: string) =>
  api.post('/auth/refresh', { refreshToken }).then(r => r.data.data);

export const logout = () => api.post('/auth/logout');
