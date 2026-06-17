import * as auctionEngine from '../../services/auctionEngine.js';
import { logger } from '../../utils/logger.js';

export const auctionHandler = (socket, io) => {
  // Join auction room
  socket.on('join_auction', (auctionId) => {
    socket.join(`auction_${auctionId}`);
    logger.info(`User ${socket.userId} joined auction_${auctionId}`);
    socket.emit('joined_auction', { auctionId });
  });

  // Place bid via WebSocket (alternative to REST)
  socket.on('place_bid', async ({ auctionId, amount }) => {
    try {
      const userId = socket.userId;
      const result = await auctionEngine.placeBid(auctionId, userId, amount);
      socket.emit('bid_success', result);
    } catch (err) {
      socket.emit('bid_error', { message: err.message });
    }
  });

  // Leave auction room
  socket.on('leave_auction', (auctionId) => {
    socket.leave(`auction_${auctionId}`);
    logger.info(`User ${socket.userId} left auction_${auctionId}`);
  });
};
