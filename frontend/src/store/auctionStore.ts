import { create } from 'zustand';
import type { Bid, Auction } from '../types/auction.types';
import { socket } from '../utils/socket';

interface AuctionState {
  currentAuction: Auction | null;
  currentBid: number;
  bidHistory: Bid[];
  isConnected: boolean;
  timeLeft: number;
  setAuction: (auction: Auction) => void;
  onNewBid: (bid: Bid) => void;
  setTimeLeft: (ms: number) => void;
  connectToAuction: (auctionId: string) => void;
  disconnectFromAuction: (auctionId: string) => void;
  reset: () => void;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  currentAuction: null,
  currentBid: 0,
  bidHistory: [],
  isConnected: false,
  timeLeft: 0,

  setAuction: (auction) =>
    set({ currentAuction: auction, currentBid: auction.currentHighestBid, timeLeft: auction.endTime - Date.now() }),

  onNewBid: (bid) =>
    set((state) => ({
      currentBid: bid.amount,
      bidHistory: [bid, ...state.bidHistory].slice(0, 50),
    })),

  setTimeLeft: (ms) => set({ timeLeft: ms }),

  connectToAuction: (auctionId) => {
    socket.emit('join_auction', auctionId);
    socket.on('new_bid', (bid: Bid) => get().onNewBid(bid));
    socket.on('auction_extended', ({ newEndTime }: { newEndTime: number }) => {
      set({ timeLeft: newEndTime - Date.now() });
    });
    set({ isConnected: true });
  },

  disconnectFromAuction: (auctionId) => {
    socket.emit('leave_auction', auctionId);
    socket.off('new_bid');
    socket.off('auction_extended');
    set({ isConnected: false });
  },

  reset: () => set({ currentAuction: null, currentBid: 0, bidHistory: [], isConnected: false }),
}));
