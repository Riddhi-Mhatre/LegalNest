import { Socket, Server } from 'socket.io';
import { logger } from '../../utils/logger';

// Map userId → socketId for targeted pushes
const userSocketMap = new Map<string, string>();

export const notificationHandler = (socket: Socket, io: Server) => {
  const userId = (socket as any).userId;
  userSocketMap.set(userId, socket.id);

  socket.on('disconnect', () => {
    userSocketMap.delete(userId);
  });
};

// Push notification to a specific user (called from services)
export const pushNotificationToUser = (io: Server, userId: string, notification: any) => {
  const socketId = userSocketMap.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    logger.info(`Pushed notification to user ${userId}`);
  }
};
