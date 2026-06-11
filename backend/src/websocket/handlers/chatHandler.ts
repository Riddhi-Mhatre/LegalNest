import { Socket, Server } from 'socket.io';
import * as chatService from '../../services/chatService';
import { logger } from '../../utils/logger';

export const chatHandler = (socket: Socket, io: Server) => {
  // Join chat room
  socket.on('join_chat', (roomId: string) => {
    socket.join(`chat_${roomId}`);
    logger.info(`User ${(socket as any).userId} joined chat_${roomId}`);
  });

  // Send message
  socket.on('chat_message', async ({ roomId, content }: { roomId: string; content: string }) => {
    try {
      const senderId = (socket as any).userId;
      const message = await chatService.saveMessage(roomId, senderId, content);
      io.to(`chat_${roomId}`).emit('new_message', message);
    } catch (err: any) {
      socket.emit('chat_error', { message: err.message });
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomId }: { roomId: string }) => {
    socket.to(`chat_${roomId}`).emit('user_typing', { userId: (socket as any).userId });
  });

  // Mark read
  socket.on('mark_read', async ({ roomId }: { roomId: string }) => {
    const userId = (socket as any).userId;
    await chatService.markMessagesRead(roomId, userId);
    socket.to(`chat_${roomId}`).emit('messages_read', { userId, roomId });
  });

  // Leave chat room
  socket.on('leave_chat', (roomId: string) => {
    socket.leave(`chat_${roomId}`);
  });
};
