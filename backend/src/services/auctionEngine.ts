import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '../config/aws';
import { env } from '../config/env';
import * as AuctionModel from '../models/dynamodb/AuctionModel';
import * as BidModel from '../models/dynamodb/BidModel';
import { generateUUID } from '../utils/helpers';
import { AUCTION_CONFIG } from '../utils/constants';

// Singleton io reference – set by WebSocket server
let _io: any;
export const setIo = (io: any) => { _io = io; };

export const placeBid = async (auctionId: string, userId: string, amount: number) => {
  const auction = await AuctionModel.getAuction(auctionId);
  if (!auction) throw new Error('Auction not found');
  if (auction.status !== 'live') throw new Error('Auction not active');

  const minBid = auction.currentHighestBid + auction.bidIncrement;
  if (amount < minBid) throw new Error(`Minimum bid is ₹${minBid}`);

  // Conditional write – prevent race condition
  await dynamoClient.send(
    new UpdateCommand({
      TableName: env.DYNAMODB_AUCTIONS_TABLE,
      Key: { auctionId },
      UpdateExpression: 'SET currentHighestBid = :bid, highestBidderId = :user, updatedAt = :now',
      ConditionExpression: 'currentHighestBid = :current',
      ExpressionAttributeValues: {
        ':bid': amount,
        ':user': userId,
        ':now': new Date().toISOString(),
        ':current': auction.currentHighestBid,
      },
    })
  );

  await BidModel.putBid({ bidId: generateUUID(), auctionId, userId, amount, timestamp: Date.now(), isAutoBid: false });

  // Anti-sniping: extend if < 2 min remaining
  const timeLeft = auction.endTime - Date.now();
  if (timeLeft < AUCTION_CONFIG.SNIPE_WINDOW_MS && auction.extensionCount < AUCTION_CONFIG.MAX_EXTENSIONS) {
    await extendAuction(auctionId, auction.extensionCount);
  }

  // Process auto-bids
  await processAutoBids(auctionId, userId, amount);

  // Broadcast to auction room
  if (_io) {
    _io.to(`auction_${auctionId}`).emit('new_bid', { userId, amount, timestamp: Date.now() });
  }

  return { success: true, newBid: amount };
};

export const extendAuction = async (auctionId: string, currentExtensionCount: number) => {
  const newEndTime = Date.now() + AUCTION_CONFIG.SNIPE_WINDOW_MS;
  await dynamoClient.send(
    new UpdateCommand({
      TableName: env.DYNAMODB_AUCTIONS_TABLE,
      Key: { auctionId },
      UpdateExpression: 'SET endTime = :end, extensionCount = :ext',
      ExpressionAttributeValues: {
        ':end': newEndTime,
        ':ext': currentExtensionCount + 1,
      },
    })
  );
  if (_io) {
    _io.to(`auction_${auctionId}`).emit('auction_extended', { newEndTime });
  }
};

export const processAutoBids = async (auctionId: string, lastBidderId: string, lastAmount: number) => {
  // TODO: Query auto-bid configurations and place incremental bids for other users
  // Complex logic deferred to Sprint 3
};

export const getBidHistory = async (auctionId: string) => {
  return BidModel.getBidHistory(auctionId);
};

export const setAutoBid = async (auctionId: string, userId: string, maxAmount: number) => {
  // Store auto-bid config – to be implemented in BidModel
  return { auctionId, userId, maxAmount, status: 'active' };
};
