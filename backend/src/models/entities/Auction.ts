export interface Auction {
  auctionId: string;
  propertyId: string;
  sellerId: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  startingPrice: number;
  currentHighestBid: number;
  highestBidderId?: string;
  bidIncrement: number;
  startTime: number; // epoch ms
  endTime: number;   // epoch ms
  extensionCount: number;
  maxExtensions: number;
  snipeWindowMs: number;
  winnerId?: string;
  createdAt: string;
  updatedAt?: string;
}
