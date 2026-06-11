export type AuctionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface Auction {
  auctionId: string;
  propertyId: string;
  sellerId: string;
  status: AuctionStatus;
  startingPrice: number;
  currentHighestBid: number;
  highestBidderId?: string;
  bidIncrement: number;
  startTime: number;
  endTime: number;
  extensionCount: number;
  maxExtensions: number;
  winnerId?: string;
  createdAt: string;
}

export interface Bid {
  bidId: string;
  auctionId: string;
  userId: string;
  amount: number;
  timestamp: number;
  isAutoBid: boolean;
}
