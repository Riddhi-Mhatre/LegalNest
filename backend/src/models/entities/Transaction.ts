export interface Transaction {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  propertyId: string;
  auctionId?: string;
  type: 'direct' | 'auction';
  status: 'interest_expressed' | 'admin_approved' | 'chat_unlocked' | 'meeting_scheduled' | 'completed' | 'cancelled';
  finalPrice?: number;
  commissionAmount?: number;
  interestId?: string;
  chatRoomId?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}
