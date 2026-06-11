export interface ChatRoom {
  roomId: string;
  buyerId: string;
  sellerId: string;
  transactionId: string;
  createdAt: string;
  isActive: boolean;
  lastMessage?: Message;
}

export interface Message {
  roomId: string;
  messageId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}
