import { api } from './api';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const getProfile = () => api.get('/users/profile').then(r => r.data.data);

export const updateProfile = (data: object) =>
  api.put('/users/profile', data).then(r => r.data.data);

export const getDocumentUploadUrl = (fileName: string, fileType: string, docType: string) =>
  api.post('/users/documents/upload-url', { fileName, fileType, docType }).then(r => r.data.data);

export const uploadIdentityDocumentToS3 = async (file: File, docType: string): Promise<string> => {
  const data = await getDocumentUploadUrl(file.name, file.type, docType);
  await axios.put(data.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
  });
  return data.s3Key;
};

export const getNotifications = () => {
  const role = useAuthStore.getState().user?.role;
  const path = role === 'buyer' ? '/buyer/notifications' : '/users/notifications';
  return api.get(path).then(r => r.data.data);
};

export const markNotificationRead = (notificationId: string) => {
  const role = useAuthStore.getState().user?.role;
  if (role === 'buyer') {
    return api.put(`/buyer/notifications/${notificationId}/read`).then(r => r.data);
  }
  return Promise.resolve();
};

export const deleteNotification = (notificationId: string) => {
  const role = useAuthStore.getState().user?.role;
  if (role === 'buyer') {
    return api.delete(`/buyer/notifications/${notificationId}`).then(r => r.data);
  }
  return Promise.resolve();
};

export const getBuyerBids = () =>
  api.get('/buyer/bids').then(r => r.data.data);

export const getPurchases = () =>
  api.get('/buyer/purchases').then(r => r.data.data);

export const getSavedProperties = () =>
  api.get('/buyer/saved-properties').then(r => r.data.data);

export const saveProperty = (propertyId: string) =>
  api.post(`/buyer/saved-properties/${propertyId}`).then(r => r.data.data);

export const removeSavedProperty = (propertyId: string) =>
  api.delete(`/buyer/saved-properties/${propertyId}`).then(r => r.data.data);
