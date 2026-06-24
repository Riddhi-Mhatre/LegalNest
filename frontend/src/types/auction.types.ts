export type AuctionStatus = 'scheduled' | 'live' | 'ended' | 'completed' | 'cancelled';

export interface Auction {
  auctionId: string;
  propertyId: string;
  sellerId: string;
  status: AuctionStatus;
  startingPrice: number;
  reservePrice: number;
  currentHighestBid: number;
  highestBidderId?: string;
  bidIncrement: number;
  startTime: string;
  endTime: string;
  extensionCount: number;
  maxExtensions: number;
  winnerId?: string;
  createdAt: string;
  bids?: Bid[];
}

export interface AuctionWithProperty extends Auction {
  property?: {
    title: string;
    images: string[];
    city?: string;
    state?: string;
    location?: { city: string; state: string };
    salePrice?: number;
    price?: number;
  };
}

export interface Bid {
  bidId: string;
  auctionId: string;
  bidderId: string;
  bidderName?: string;
  userId?: string;
  amount: number;
  timestamp: number;
  createdAt?: string;
  isAutoBid: boolean;
}

export interface CreateAuctionPayload {
  startingPrice: number;
  reservePrice: number;
  bidIncrement: number;
  startTime: string;
  endTime: string;
}
