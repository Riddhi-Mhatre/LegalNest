import * as buyerService from '../services/buyerService.js';

import * as buyerNotificationService from '../services/buyerNotificationService.js';
import * as auctionEngine from '../services/auctionEngine.js';
import * as AuctionModel from '../models/dynamodb/AuctionModel.js';
import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as PurchaseModel from '../models/dynamodb/PurchaseModel.js';
import * as s3Service from '../services/s3Service.js';
import { HTTP } from '../utils/constants.js';

// ─── Dashboard ─────────────────────────────────────────────────────────────────
// GET /v1/buyer/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const stats = await buyerService.getDashboardStats(req.user.userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// ─── Recommendations ───────────────────────────────────────────────────────────
// GET /v1/buyer/recommendations
export const getRecommendations = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const result = await buyerService.getRecommendations(req.user.userId, page, limit);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ─── Saved Properties ──────────────────────────────────────────────────────────
// POST /v1/buyer/saved-properties/:propertyId
export const saveProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const result = await buyerService.saveProperty(req.user.userId, propertyId);
    res.status(HTTP.CREATED).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /v1/buyer/saved-properties
export const getSavedProperties = async (req, res, next) => {
  try {
    const items = await buyerService.getSavedProperties(req.user.userId);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

// DELETE /v1/buyer/saved-properties/:propertyId
export const removeSavedProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    await buyerService.removeSavedProperty(req.user.userId, propertyId);
    res.json({ success: true, message: 'Removed from saved properties' });
  } catch (err) {
    next(err);
  }
};

// ─── Bids ──────────────────────────────────────────────────────────────────────
// GET /v1/buyer/bids
export const getMyBids = async (req, res, next) => {
  try {
    const bids = await buyerService.getBuyerBidsEnriched(req.user.userId);
    res.json({ success: true, data: bids });
  } catch (err) {
    next(err);
  }
};

// ─── Auction Participation ─────────────────────────────────────────────────────
// GET /v1/buyer/auctions
export const listActiveAuctions = async (req, res, next) => {
  try {
    const { status = 'live' } = req.query;
    const auctions = await AuctionModel.getAuctionsByStatus(status);
    res.json({ success: true, data: auctions });
  } catch (err) {
    next(err);
  }
};

// GET /v1/buyer/auctions/:auctionId
export const getAuction = async (req, res, next) => {
  try {
    const auction = await AuctionModel.getAuction(req.params.auctionId);
    if (!auction) {
      return res.status(HTTP.NOT_FOUND).json({
        success: false,
        error: { code: 'AUC_001', message: 'Auction not found' },
      });
    }
    res.json({ success: true, data: auction });
  } catch (err) {
    next(err);
  }
};

// POST /v1/buyer/auctions/:auctionId/bid
export const placeBid = async (req, res, next) => {
  try {
    const { auctionId } = req.params;
    const { amount } = req.body;
    const buyerId = req.user.userId;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(HTTP.BAD_REQUEST).json({
        success: false,
        error: { code: 'BID_001', message: 'Invalid bid amount' },
      });
    }

    // Check buyer not bidding on own property (via auction → property → sellerId)
    const auction = await AuctionModel.getAuction(auctionId);
    if (!auction) {
      return res.status(HTTP.NOT_FOUND).json({
        success: false,
        error: { code: 'AUC_001', message: 'Auction not found' },
      });
    }

    if (auction.sellerId === buyerId) {
      return res.status(HTTP.FORBIDDEN).json({
        success: false,
        error: { code: 'BID_002', message: 'Cannot bid on your own auction' },
      });
    }

    const result = await auctionEngine.placeBid(auctionId, buyerId, amount);
    res.json({ success: true, data: result });
  } catch (err) {
    // Propagate bid-specific errors with proper messages
    if (err.message?.startsWith('Minimum bid')) {
      return res.status(HTTP.BAD_REQUEST).json({
        success: false,
        error: { code: 'BID_003', message: err.message },
      });
    }
    next(err);
  }
};


// ─── Legal Documents ───────────────────────────────────────────────────────────
// GET /v1/buyer/properties/:propertyId/documents
export const getPropertyDocuments = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const property = await PropertyModel.getProperty(propertyId);
    if (!property) {
      return res.status(HTTP.NOT_FOUND).json({
        success: false,
        error: { code: 'PROP_001', message: 'Property not found' },
      });
    }

    const docs = property.documents ?? {};
    // Generate secure presigned read URLs for each document key
    const signedDocs = {};
    for (const [docType, s3Key] of Object.entries(docs)) {
      if (s3Key) {
        try {
          signedDocs[docType] = await s3Service.getDocumentReadUrl(s3Key);
        } catch {
          signedDocs[docType] = null;
        }
      }
    }

    res.json({
      success: true,
      data: {
        propertyId,
        verificationStatus: property.verificationStatus,
        documents: signedDocs,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /v1/buyer/properties/:propertyId/legal-report
export const getLegalReport = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const property = await PropertyModel.getProperty(propertyId);
    if (!property) {
      return res.status(HTTP.NOT_FOUND).json({
        success: false,
        error: { code: 'PROP_001', message: 'Property not found' },
      });
    }

    const report = {
      propertyId,
      title: property.title,
      verificationStatus: property.verificationStatus,
      ownershipVerified: !!(property.documents?.saleDeed),
      taxClearance: !!(property.documents?.taxReceipt),
      encumbranceCertificate: !!(property.documents?.noc),
      verifiedAt: property.updatedAt ?? null,
      documents: Object.keys(property.documents ?? {}),
    };

    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// ─── Purchased Properties ─────────────────────────────────────────────────────
// GET /v1/buyer/purchases
export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await PurchaseModel.getPurchasesByBuyer(req.user.userId);
    const enriched = await Promise.all(
      purchases.map(async (p) => {
        const property = await PropertyModel.getProperty(p.propertyId);
        return { ...p, property: property ?? null };
      })
    );
    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};


// ─── Notifications ────────────────────────────────────────────────────────────
// GET /v1/buyer/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { limit, type } = req.query;
    const notifications = await buyerNotificationService.getNotifications(req.user.userId, {
      limit: limit ? parseInt(limit) : undefined,
      type,
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/buyer/notifications/:notificationId/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const updated = await buyerNotificationService.markNotificationRead(
      req.user.userId,
      notificationId
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /v1/buyer/notifications/:notificationId
export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await buyerNotificationService.deleteNotification(req.user.userId, notificationId);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Profile ──────────────────────────────────────────────────────────────────
// GET /v1/buyer/profile
export const getProfile = async (req, res, next) => {
  try {
    const { getUser } = await import('../models/dynamodb/UserModel.js');
    const user = await getUser(req.user.userId);
    if (!user) {
      return res.status(HTTP.NOT_FOUND).json({
        success: false,
        error: { code: 'USER_001', message: 'User not found' },
      });
    }
    // Strip sensitive fields
    const { password, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/buyer/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { updateUser } = await import('../models/dynamodb/UserModel.js');
    const ALLOWED = ['preferredLocations', 'budgetMin', 'budgetMax', 'preferredPropertyTypes', 'notificationPreferences', 'name', 'phone'];
    const updates = {};
    for (const key of ALLOWED) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }
    if (!Object.keys(updates).length) {
      return res.status(HTTP.BAD_REQUEST).json({
        success: false,
        error: { code: 'PROF_001', message: 'No valid fields to update' },
      });
    }
    const updated = await updateUser(req.user.userId, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
