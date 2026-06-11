import { api } from './api';

export const getRooms = () => api.get('/chat/rooms').then(r => r.data.data);

export const getMessages = (roomId: string) =>
  api.get(`/chat/rooms/${roomId}/messages`).then(r => r.data.data);

export const sendMessage = (roomId: string, content: string) =>
  api.post(`/chat/rooms/${roomId}/messages`, { content }).then(r => r.data.data);

export const markRead = (roomId: string) =>
  api.put(`/chat/rooms/${roomId}/read`).then(r => r.data.data);
