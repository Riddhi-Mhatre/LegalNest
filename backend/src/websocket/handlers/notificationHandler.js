import { logger } from '../../utils/logger.js';

// Map userId → socketId for targeted pushes
const userSocketMap = new Map();

export const notificationHandler = (socket, io) => {
  const userId = socket.userId;
  userSocketMap.set(userId, socket.id);

  socket.on('disconnect', () => {
    userSocketMap.delete(userId);
  });
};

// Push notification to a specific user (called from services)
export const pushNotificationToUser = (io, userId, notification) => {
  const socketId = userSocketMap.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    logger.info(`Pushed notification to user ${userId}`);
  }
};
