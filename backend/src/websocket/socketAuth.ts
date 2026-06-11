import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { env } from '../config/env';

export const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
  if (!token) return next(new Error('Authentication error: no token'));
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    (socket as any).userId = decoded.userId;
    (socket as any).userRole = decoded.role;
    next();
  } catch {
    next(new Error('Authentication error: invalid token'));
  }
};
