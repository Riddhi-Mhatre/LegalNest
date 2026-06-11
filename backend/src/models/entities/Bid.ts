export interface Bid {
  bidId: string;
  auctionId: string; // PK
  timestamp: number; // SK (epoch ms)
  userId: string;
  amount: number;
  isAutoBid: boolean;
}
