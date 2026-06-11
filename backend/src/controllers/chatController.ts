import { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chatService';
import { HTTP } from '../utils/constants';

// GET /v1/chat/rooms
export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const rooms = await chatService.getUserRooms(userId);
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
};

// GET /v1/chat/rooms/:roomId/messages
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    const messages = await chatService.getMessages(roomId);
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

// POST /v1/chat/rooms/:roomId/messages
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = (req as any).user.userId;
    const { roomId } = req.params;
    const { content } = req.body;
    const message = await chatService.saveMessage(roomId, senderId, content);
    res.status(HTTP.CREATED).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/chat/rooms/:roomId/read
export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { roomId } = req.params;
    await chatService.markMessagesRead(roomId, userId);
    res.json({ success: true, data: { message: 'Messages marked as read' } });
  } catch (err) {
    next(err);
  }
};
