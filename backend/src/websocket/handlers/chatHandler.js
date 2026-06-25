import * as chatService from '../../services/chatService.js';
import { logger } from '../../utils/logger.js';

export const chatHandler = (socket, io) => {
  // Join chat room
  socket.on('join_chat', (roomId) => {
    socket.join(`chat_${roomId}`);
    logger.info(`User ${socket.userId} joined chat_${roomId}`);
  });

  // Send message
  socket.on('chat_message', async ({ roomId, content }) => {
    try {
      const senderId = socket.userId;
      const message = await chatService.saveMessage(roomId, senderId, content);
      io.to(`chat_${roomId}`).emit('new_message', message);
      
      // Also notify the recipient globally
      const room = await chatService.getRoom(roomId);
      if (room) {
        const recipientId = room.buyerId === senderId ? room.sellerId : room.buyerId;
        io.to(`user_${recipientId}`).emit('chat_alert', {
          roomId,
          message: 'You have a new message'
        });
      }
    } catch (err) {
      socket.emit('chat_error', { message: err.message });
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomId }) => {
    socket.to(`chat_${roomId}`).emit('user_typing', { userId: socket.userId });
  });

  // Mark read
  socket.on('mark_read', async ({ roomId }) => {
    const userId = socket.userId;
    await chatService.markMessagesRead(roomId, userId);
    socket.to(`chat_${roomId}`).emit('messages_read', { userId, roomId });
  });

  // Leave chat room
  socket.on('leave_chat', (roomId) => {
    socket.leave(`chat_${roomId}`);
  });
};
