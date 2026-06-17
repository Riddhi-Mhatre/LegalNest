import * as chatService from '../services/chatService.js';
import { HTTP } from '../utils/constants.js';

// GET /v1/chat/rooms
export const getRooms = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rooms = await chatService.getUserRooms(userId);
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
};

// GET /v1/chat/rooms/:roomId/messages
export const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const messages = await chatService.getMessages(roomId);
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

// POST /v1/chat/rooms/:roomId/messages
export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const { roomId } = req.params;
    const { content } = req.body;
    const message = await chatService.saveMessage(roomId, senderId, content);
    res.status(HTTP.CREATED).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/chat/rooms/:roomId/read
export const markRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    await chatService.markMessagesRead(roomId, userId);
    res.json({ success: true, data: { message: 'Messages marked as read' } });
  } catch (err) {
    next(err);
  }
};
