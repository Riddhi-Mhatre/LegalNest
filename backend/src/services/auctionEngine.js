import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '../config/aws.js';
import { env } from '../config/env.js';
import * as AuctionModel from '../models/dynamodb/AuctionModel.js';
import * as BidModel from '../models/dynamodb/BidModel.js';
import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as UserModel from '../models/dynamodb/UserModel.js';
import * as chatService from './chatService.js';
import { generateUUID } from '../utils/helpers.js';
import { AUCTION_CONFIG } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { createNotification } from './notificationService.js';


// Singleton io reference – set by WebSocket server
let _io;
export const setIo = (io) => { _io = io; };

// ─── Place Bid ───────────────────────────────────────────────────────────────
export const placeBid = async (auctionId, userId, amount) => {
  const auction = await AuctionModel.getAuction(auctionId);
  if (!auction) throw new Error('Auction not found');
  if (auction.status !== 'live') throw new Error('Auction is not currently live');

  const bidIncrement = auction.bidIncrement ?? AUCTION_CONFIG.DEFAULT_BID_INCREMENT;
  const minBid = (auction.currentHighestBid ?? auction.startingPrice) + bidIncrement;

  if (amount < minBid) {
    throw new Error(`Minimum bid is ₹${minBid.toLocaleString('en-IN')} (current: ₹${auction.currentHighestBid?.toLocaleString('en-IN')} + increment: ₹${bidIncrement.toLocaleString('en-IN')})`);
  }

  if (auction.highestBidderId === userId) {
    throw new Error('You are already the highest bidder');
  }

  // Conditional write – prevent race condition
  await dynamoClient.send(
    new UpdateCommand({
      TableName: env.DYNAMODB_AUCTIONS_TABLE,
      Key: { auctionId },
      UpdateExpression: 'SET currentHighestBid = :bid, highestBidderId = :user, updatedAt = :now, totalBids = if_not_exists(totalBids, :zero) + :one',
      ConditionExpression: 'currentHighestBid = :current',
      ExpressionAttributeValues: {
        ':bid': amount,
        ':user': userId,
        ':now': new Date().toISOString(),
        ':current': auction.currentHighestBid,
        ':zero': 0,
        ':one': 1,
      },
    })
  );

  const timestamp = new Date().toISOString();
  // ✅ FIX: use consistent field name `bidderId` (was `userId` before)
  await BidModel.putBid({
    bidId: generateUUID(),
    auctionId,
    bidderId: userId,   // consistent with sellerAuctionController enrichment
    amount,
    timestamp,
    isAutoBid: false,
  });

  // Anti-sniping: extend if < SNIPE_WINDOW remaining
  const endTime = new Date(auction.endTime).getTime();
  const timeLeft = endTime - Date.now();
  if (timeLeft < AUCTION_CONFIG.SNIPE_WINDOW_MS && (auction.extensionCount ?? 0) < AUCTION_CONFIG.MAX_EXTENSIONS) {
    await extendAuction(auctionId, auction.extensionCount ?? 0);
  }

  // Process auto-bids
  await processAutoBids(auctionId, userId, amount);

  // Broadcast to auction room
  if (_io) {
    _io.to(`auction_${auctionId}`).emit('new_bid', {
      bidderId: userId,
      amount,
      timestamp,
      auctionId,
    });
  }

  // Generate DB notifications so they show in the panel
  try {
    // Notify buyer
    await createNotification(
      userId,
      'bid_placed',
      'Bid Placed Successfully',
      `Your bid of ₹${amount.toLocaleString('en-IN')} was placed on auction ${auctionId}`
    );
    // Notify seller
    if (auction.sellerId) {
      await createNotification(
        auction.sellerId,
        'bid_received',
        'New Bid Received',
        `A new bid of ₹${amount.toLocaleString('en-IN')} was placed on your auction.`,
        { auctionId }
      );
    }
  } catch (err) {
    logger.error(`Failed to create bid notifications: ${err.message}`);
  }

  return { success: true, newBid: amount, auctionId };
};

// ─── Extend Auction (anti-sniping) ──────────────────────────────────────────
export const extendAuction = async (auctionId, currentExtensionCount) => {
  const newEndTime = new Date(Date.now() + AUCTION_CONFIG.SNIPE_WINDOW_MS).toISOString();
  await dynamoClient.send(
    new UpdateCommand({
      TableName: env.DYNAMODB_AUCTIONS_TABLE,
      Key: { auctionId },
      UpdateExpression: 'SET endTime = :end, extensionCount = :ext, updatedAt = :now',
      ExpressionAttributeValues: {
        ':end': newEndTime,
        ':ext': currentExtensionCount + 1,
        ':now': new Date().toISOString(),
      },
    })
  );
  if (_io) {
    _io.to(`auction_${auctionId}`).emit('auction_extended', { newEndTime, auctionId });
  }
};

// ─── Auto-Bids ───────────────────────────────────────────────────────────────
export const processAutoBids = async (auctionId, lastBidderId, lastAmount) => {
  // TODO: Query auto-bid configurations and place incremental bids for other users
  // Complex logic deferred – stub kept for Sprint 3
};

// ─── Bid History ─────────────────────────────────────────────────────────────
export const getBidHistory = async (auctionId) => {
  return BidModel.getBidHistory(auctionId);
};

// ─── Auto-Bid Config ─────────────────────────────────────────────────────────
export const setAutoBid = async (auctionId, userId, maxAmount) => {
  // Store auto-bid config – to be implemented in BidModel
  return { auctionId, userId, maxAmount, status: 'active' };
};

// ─── Auction Status Lifecycle ────────────────────────────────────────────────
/**
 * Transitions auctions between states based on startTime / endTime.
 *
 * scheduled → live    : when now >= startTime
 * live      → completed : when now >= endTime
 *
 * Runs as a scheduled job (see startAuctionScheduler).
 */
export const transitionAuctions = async () => {
  try {
    const now = new Date().toISOString();

    // 1. Activate scheduled auctions whose startTime has passed
    const scheduled = await AuctionModel.getAuctionsByStatus('scheduled');
    for (const auction of scheduled) {
      if (auction.startTime && auction.startTime <= now) {
        await AuctionModel.updateAuction(auction.auctionId, {
          status: 'live',
          updatedAt: now,
        });
        logger.info(`[Scheduler] Auction ${auction.auctionId} → live`);

        if (_io) {
          _io.to(`auction_${auction.auctionId}`).emit('auction_started', {
            auctionId: auction.auctionId,
            propertyId: auction.propertyId,
          });
          // Broadcast to general "auctions" room so the buyer listing refreshes
          _io.to('auctions').emit('auction_status_changed', {
            auctionId: auction.auctionId,
            status: 'live',
          });
        }
      }
    }

    // 2. Close live auctions whose endTime has passed
    const live = await AuctionModel.getAuctionsByStatus('live');
    for (const auction of live) {
      if (auction.endTime && auction.endTime <= now) {
        const reserveMet = (auction.currentHighestBid ?? 0) >= (auction.reservePrice ?? 0);

        // ── Winner logic ──────────────────────────────────────────────────────
        let winnerChatRoomId = null;
        let winnerName = null;

        if (auction.highestBidderId && reserveMet) {
          try {
            // Fetch property and winner in parallel
            const [property, winnerUser] = await Promise.all([
              auction.propertyId ? PropertyModel.getProperty(auction.propertyId) : Promise.resolve(null),
              UserModel.getUser(auction.highestBidderId),
            ]);

            winnerName = winnerUser?.name || winnerUser?.email || 'Winner';
            const propertyTitle = property?.title || 'the property';
            const sellerId = auction.sellerId;

            // Create the private winner chat room (seeded with congratulatory message)
            const room = await chatService.createAuctionWinnerRoom(
              auction.highestBidderId,  // buyerId (winner)
              sellerId,
              auction.propertyId,
              propertyTitle,
              winnerName,
              auction.auctionId,
              auction.currentHighestBid
            );
            winnerChatRoomId = room.roomId;

            logger.info(`[Scheduler] Auction ${auction.auctionId} → winner chat room created: ${winnerChatRoomId}`);
          } catch (winnerErr) {
            logger.error(`[Scheduler] Failed to create winner chat room for auction ${auction.auctionId}: ${winnerErr.message}`);
          }
        }

        // Persist completed state + winner metadata
        await AuctionModel.updateAuction(auction.auctionId, {
          status: 'completed',
          reserveMet,
          winnerId: auction.highestBidderId || null,
          winnerName: winnerName || null,
          winnerChatRoomId: winnerChatRoomId || null,
          updatedAt: now,
        });

        logger.info(`[Scheduler] Auction ${auction.auctionId} → completed (reserveMet: ${reserveMet}, winner: ${auction.highestBidderId ?? 'none'})`);

        if (_io) {
          // Broadcast winner details to everyone in the auction room
          _io.to(`auction_${auction.auctionId}`).emit('auction_ended', {
            auctionId: auction.auctionId,
            winnerId: auction.highestBidderId,
            winningBid: auction.currentHighestBid,
            winnerName,
            winnerChatRoomId,
            reserveMet,
          });
          // Also broadcast the richer winner event so UI can react distinctly
          _io.to(`auction_${auction.auctionId}`).emit('auction_winner', {
            auctionId: auction.auctionId,
            winnerId: auction.highestBidderId,
            winningBid: auction.currentHighestBid,
            winnerName,
            winnerChatRoomId,
          });
          _io.to('auctions').emit('auction_status_changed', {
            auctionId: auction.auctionId,
            status: 'completed',
          });
        }
      }
    }

  } catch (err) {
    logger.error(`[Scheduler] transitionAuctions error: ${err.message}`);
  }
};

/**
 * Starts the recurring auction scheduler.
 * Runs immediately on call, then every SCHEDULER_INTERVAL_MS milliseconds.
 */
export const startAuctionScheduler = () => {
  const INTERVAL_MS = 30_000; // 30 seconds
  logger.info(`[Scheduler] Auction lifecycle scheduler started (interval: ${INTERVAL_MS / 1000}s)`);

  // Run immediately on startup to catch any auctions that transitioned while server was down
  transitionAuctions();

  // Then poll every 30 seconds
  setInterval(transitionAuctions, INTERVAL_MS);
};
