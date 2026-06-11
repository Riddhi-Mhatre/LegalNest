import { Server } from 'socket.io';
import { authenticateSocket } from './socketAuth';
import { auctionHandler } from './handlers/auctionHandler';
import { chatHandler } from './handlers/chatHandler';
import { notificationHandler } from './handlers/notificationHandler';
import { setIo } from '../services/auctionEngine';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export let io: Server;

export const initWebSocket = (httpServer: any): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT auth on socket handshake
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} user: ${(socket as any).userId}`);

    auctionHandler(socket, io);
    chatHandler(socket, io);
    notificationHandler(socket, io);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} reason: ${reason}`);
    });
  });

  // Share io with auction engine for bid broadcasts
  setIo(io);

  return io;
};
