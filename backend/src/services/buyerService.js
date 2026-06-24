import * as SavedPropertiesModel from '../models/dynamodb/SavedPropertiesModel.js';
import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as AuctionModel from '../models/dynamodb/AuctionModel.js';
import * as BidModel from '../models/dynamodb/BidModel.js';
import * as VisitModel from '../models/dynamodb/VisitModel.js';
import * as PurchaseModel from '../models/dynamodb/PurchaseModel.js';
import * as notificationService from './notificationService.js';
import { env } from '../config/env.js';

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = async (buyerId) => {
  const [saved, visits, purchases, notifications, bids] = await Promise.all([
    SavedPropertiesModel.getSaved(buyerId),
    VisitModel.getVisitsByBuyer(buyerId),
    PurchaseModel.getPurchasesByBuyer(buyerId),
    notificationService.getUserNotifications(buyerId),
    getBuyerBidsFromBidTable(buyerId),
  ]);

  const activeBids = bids.filter(b => b.auctionStatus === 'live');
  const wonAuctions = bids.filter(b => b.auctionStatus === 'ended' && b.isWinner);
  const scheduledVisits = visits.filter(v => v.status === 'scheduled' || v.status === 'confirmed');
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return {
    savedProperties: saved.length,
    activeBids: activeBids.length,
    wonAuctions: wonAuctions.length,
    scheduledVisits: scheduledVisits.length,
    purchasedProperties: purchases.length,
    notifications: unreadNotifications.length,
  };
};

// ─── Recommendations ───────────────────────────────────────────────────────────
export const getRecommendations = async (buyerId, page = 1, limit = 12) => {
  // Fetch buyer saved properties for preference inference
  const saved = await SavedPropertiesModel.getSaved(buyerId);
  const savedIds = new Set(saved.map(s => s.propertyId));

  // Fetch all approved properties
  const all = await PropertyModel.queryProperties({ verificationStatus: 'approved' });

  // Filter out already-saved, paginate
  const filtered = all.filter(p => !savedIds.has(p.propertyId));
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);

  return {
    items: slice,
    page,
    limit,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / limit),
  };
};

// ─── Saved Properties ──────────────────────────────────────────────────────────
export const saveProperty = async (buyerId, propertyId) => {
  const exists = await SavedPropertiesModel.checkExists(buyerId, propertyId);
  if (exists) {
    const err = new Error('Property already saved');
    err.statusCode = 409;
    throw err;
  }
  const property = await PropertyModel.getProperty(propertyId);
  if (!property) {
    const err = new Error('Property not found');
    err.statusCode = 404;
    throw err;
  }
  return SavedPropertiesModel.saveProp({
    buyerId,
    propertyId,
    savedAt: new Date().toISOString(),
    propertySnapshot: {
      title: property.title,
      price: property.price ?? property.salePrice ?? 0,
      type: property.type,
      location: property.location,
    },
  });
};

export const getSavedProperties = async (buyerId) => {
  const saved = await SavedPropertiesModel.getSaved(buyerId);
  // Enrich with fresh property data
  const enriched = await Promise.all(
    saved.map(async (item) => {
      const property = await PropertyModel.getProperty(item.propertyId);
      return { ...item, property: property || null };
    })
  );
  return enriched;
};

export const removeSavedProperty = async (buyerId, propertyId) => {
  const exists = await SavedPropertiesModel.checkExists(buyerId, propertyId);
  if (!exists) {
    const err = new Error('Saved property not found');
    err.statusCode = 404;
    throw err;
  }
  return SavedPropertiesModel.deleteSaved(buyerId, propertyId);
};

// ─── Bids ──────────────────────────────────────────────────────────────────────
export const getBuyerBidsFromBidTable = async (buyerId) => {
  // Bids table: auctionId (PK) + bidId (SK), no buyerId GSI in current model
  // We scan by userId from the bids stored by auctionEngine
  const { dynamoClient } = await import('../config/aws.js');
  const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
  const result = await dynamoClient.send(
    new ScanCommand({
      TableName: env.DYNAMODB_BIDS_TABLE,
      FilterExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': buyerId },
    })
  );
  return result.Items ?? [];
};

export const getBuyerBidsEnriched = async (buyerId) => {
  const bids = await getBuyerBidsFromBidTable(buyerId);
  const enriched = await Promise.all(
    bids.map(async (bid) => {
      const auction = await AuctionModel.getAuction(bid.auctionId);
      if (!auction) return null;
      const property = auction.propertyId ? await PropertyModel.getProperty(auction.propertyId) : null;
      const highestBid = await BidModel.getHighestBidder(bid.auctionId);
      const isWinner = highestBid?.userId === buyerId;
      let status = 'outbid';
      if (auction.status === 'live') {
        status = isWinner ? 'winning' : 'outbid';
      } else if (auction.status === 'ended') {
        status = isWinner ? 'won' : 'lost';
      }
      return {
        bidId: bid.bidId,
        auctionId: bid.auctionId,
        amount: bid.amount,
        timestamp: bid.timestamp,
        propertyId: auction.propertyId,
        propertyName: property?.title ?? 'Unknown',
        image: property?.images?.[0] ?? '',
        currentHighestBid: auction.currentHighestBid ?? 0,
        myBid: bid.amount,
        auctionStatus: auction.status,
        auctionEndTime: auction.endTime,
        isWinner,
        status,
      };
    })
  );
  return enriched.filter(Boolean);
};
