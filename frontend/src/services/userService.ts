import { api } from './api';

export const getProfile = () => api.get('/users/profile').then(r => r.data.data);

export const updateProfile = (data: object) =>
  api.put('/users/profile', data).then(r => r.data.data);

export const getDocumentUploadUrl = (fileName: string, fileType: string, docType: string) =>
  api.post('/users/documents/upload-url', { fileName, fileType, docType }).then(r => r.data.data);

export const getNotifications = () =>
  api.get('/users/notifications').then(r => r.data.data);
