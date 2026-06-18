import { api } from './api';

export const getDashboardStats = async (): Promise<any> => {
  const response = await api.get('/admin/dashboard');
  return response.data.data;
};

export const getUsers = async (): Promise<any> => {
  const response = await api.get('/admin/users');
  return response.data.data;
};

export const verifyUser = async (userId: string): Promise<any> => {
  const response = await api.put(`/admin/users/${userId}/verify`);
  return response.data.data;
};

export const getPendingProperties = async (): Promise<any> => {
  const response = await api.get('/admin/properties/pending');
  return response.data.data;
};

export const approveProperty = async (id: string): Promise<any> => {
  const response = await api.put(`/admin/properties/${id}/approve`);
  return response.data.data;
};

export const rejectProperty = async (id: string, reason: string): Promise<any> => {
  const response = await api.put(`/admin/properties/${id}/reject`, { reason });
  return response.data.data;
};

export const scheduleAuction = async (data: any): Promise<any> => {
  const response = await api.post('/admin/auctions', data);
  return response.data.data;
};
