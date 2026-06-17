import { Server } from 'socket.io';
import { authenticateSocket } from './socketAuth.js';
import { auctionHandler } from './handlers/auctionHandler.js';
import { chatHandler } from './handlers/chatHandler.js';
import { notificationHandler } from './handlers/notificationHandler.js';
import { setIo } from '../services/auctionEngine.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export let io;

export const initWebSocket = (httpServer) => {
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
    logger.info(`Socket connected: ${socket.id} user: ${socket.userId}`);

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
