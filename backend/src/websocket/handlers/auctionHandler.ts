import { Socket, Server } from 'socket.io';
import * as auctionEngine from '../../services/auctionEngine';
import { logger } from '../../utils/logger';

export const auctionHandler = (socket: Socket, io: Server) => {
  // Join auction room
  socket.on('join_auction', (auctionId: string) => {
    socket.join(`auction_${auctionId}`);
    logger.info(`User ${(socket as any).userId} joined auction_${auctionId}`);
    socket.emit('joined_auction', { auctionId });
  });

  // Place bid via WebSocket (alternative to REST)
  socket.on('place_bid', async ({ auctionId, amount }: { auctionId: string; amount: number }) => {
    try {
      const userId = (socket as any).userId;
      const result = await auctionEngine.placeBid(auctionId, userId, amount);
      socket.emit('bid_success', result);
    } catch (err: any) {
      socket.emit('bid_error', { message: err.message });
    }
  });

  // Leave auction room
  socket.on('leave_auction', (auctionId: string) => {
    socket.leave(`auction_${auctionId}`);
    logger.info(`User ${(socket as any).userId} left auction_${auctionId}`);
  });
};
