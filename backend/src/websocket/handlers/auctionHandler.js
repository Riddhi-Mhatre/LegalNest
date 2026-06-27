import * as auctionEngine from '../../services/auctionEngine.js';
import { logger } from '../../utils/logger.js';

export const auctionHandler = (socket, io) => {
  // Join the general auctions room (buyer listing page uses this to stay updated)
  socket.on('join_auctions_room', () => {
    socket.join('auctions');
    logger.info(`User ${socket.userId} joined general auctions room`);
    socket.emit('joined_auctions_room', { room: 'auctions' });
  });

  // Join a specific auction room (for live bid feed)
  socket.on('join_auction', (data) => {
    const auctionId = typeof data === 'object' && data !== null ? data.auctionId : data;
    if (!auctionId) return socket.emit('error', { message: 'auctionId is required' });
    socket.join(`auction_${auctionId}`);
    logger.info(`User ${socket.userId} joined auction_${auctionId}`);
    socket.emit('joined_auction', { auctionId });
  });

  // Place bid via WebSocket (alternative to REST POST)
  socket.on('place_bid', async ({ auctionId, amount }) => {
    try {
      if (!auctionId || !amount) {
        return socket.emit('bid_error', { message: 'auctionId and amount are required' });
      }
      const userId = socket.userId;
      const result = await auctionEngine.placeBid(auctionId, userId, amount);
      socket.emit('bid_success', result);
    } catch (err) {
      socket.emit('bid_error', { message: err.message });
    }
  });

  // Leave a specific auction room
  socket.on('leave_auction', (data) => {
    const auctionId = typeof data === 'object' && data !== null ? data.auctionId : data;
    socket.leave(`auction_${auctionId}`);
    logger.info(`User ${socket.userId} left auction_${auctionId}`);
  });

  // Leave the general auctions room
  socket.on('leave_auctions_room', () => {
    socket.leave('auctions');
    logger.info(`User ${socket.userId} left general auctions room`);
  });
};
