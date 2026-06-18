import * as AuctionModel from '../models/dynamodb/AuctionModel.js';
import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as UserModel from '../models/dynamodb/UserModel.js';
import * as auctionEngine from '../services/auctionEngine.js';
import { HTTP } from '../utils/constants.js';
import { generateUUID } from '../utils/helpers.js';

// POST /v1/seller/properties/:id/auction
export const scheduleAuction = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { id: propertyId } = req.params;
    const { startingPrice, reservePrice, startTime, endTime } = req.body;

    const property = await PropertyModel.getProperty(propertyId);
    if (!property) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'PROP_001', message: 'Property not found' } });
    }
    if (property.sellerId !== sellerId) {
      return res.status(HTTP.FORBIDDEN).json({ success: false, error: { code: 'AUTH_003', message: 'Access denied' } });
    }
    if (property.verificationStatus !== 'approved') {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_002', message: 'Property must be approved to schedule auction' } });
    }

    const auctionId = generateUUID();
    const auction = await AuctionModel.createAuction({
      auctionId,
      propertyId,
      sellerId,
      startingPrice: Number(startingPrice),
      reservePrice: Number(reservePrice),
      startTime,
      endTime,
      status: 'scheduled',
      currentHighestBid: Number(startingPrice),
      extensionCount: 0,
      createdAt: new Date().toISOString(),
    });

    await PropertyModel.updateProperty(propertyId, {
      isAuctionRequested: true,
      updatedAt: new Date().toISOString(),
    });

    res.status(HTTP.CREATED).json({ success: true, data: auction });
  } catch (err) {
    next(err);
  }
};

// GET /v1/seller/properties/:id/auction
export const getAuctionDetails = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { id: propertyId } = req.params;

    const property = await PropertyModel.getProperty(propertyId);
    if (!property || property.sellerId !== sellerId) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'PROP_001', message: 'Property not found' } });
    }

    // Usually you'd query by propertyId using a GSI. We'll scan here since it's mock DB.
    // Let's assume there's only one auction per property for now.
    const allAuctions = await AuctionModel.getAuctionsByStatus('scheduled');
    const liveAuctions = await AuctionModel.getAuctionsByStatus('live');
    const endedAuctions = await AuctionModel.getAuctionsByStatus('completed');
    
    const auction = [...allAuctions, ...liveAuctions, ...endedAuctions].find(a => a.propertyId === propertyId);
    
    res.json({ success: true, data: auction || null });
  } catch (err) {
    next(err);
  }
};

// GET /v1/seller/properties/:id/auction/bids
export const getAuctionHistory = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { id: propertyId } = req.params;

    const property = await PropertyModel.getProperty(propertyId);
    if (!property || property.sellerId !== sellerId) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'PROP_001', message: 'Property not found' } });
    }

    const allAuctions = await AuctionModel.getAuctionsByStatus('scheduled');
    const liveAuctions = await AuctionModel.getAuctionsByStatus('live');
    const endedAuctions = await AuctionModel.getAuctionsByStatus('completed');
    
    const auction = [...allAuctions, ...liveAuctions, ...endedAuctions].find(a => a.propertyId === propertyId);
    
    if (!auction) {
       return res.json({ success: true, data: [] });
    }

    const bids = await auctionEngine.getBidHistory(auction.auctionId);
    
    // Enrich bids with user names
    const bidderIds = [...new Set(bids.map(b => b.bidderId))];
    const bidders = await UserModel.getUsersBatch(bidderIds);
    const bidderMap = Object.fromEntries(bidders.map(b => [b.userId, b]));

    const enrichedBids = bids.map(b => ({
      ...b,
      bidderName: bidderMap[b.bidderId]?.name || 'Unknown Bidder',
    }));

    res.json({ success: true, data: enrichedBids });
  } catch (err) {
    next(err);
  }
};

// GET /v1/seller/properties/:id/interested-buyers
export const getInterestedBuyers = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { id: propertyId } = req.params;

    const property = await PropertyModel.getProperty(propertyId);
    if (!property || property.sellerId !== sellerId) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'PROP_001', message: 'Property not found' } });
    }

    const buyerIds = property.interestedBuyers || [];
    const buyers = await UserModel.getUsersBatch(buyerIds);
    
    const safeBuyers = buyers.map(b => ({
      userId: b.userId,
      name: b.name,
      email: b.email,
    }));

    res.json({ success: true, data: safeBuyers });
  } catch (err) {
    next(err);
  }
};

// GET /v1/seller/auctions
export const getAllSellerAuctions = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const auctions = await AuctionModel.getAuctionsBySeller(sellerId);
    
    // Aggregate stats
    const stats = {
      total: auctions.length,
      active: auctions.filter(a => a.status === 'live').length,
      completed: auctions.filter(a => a.status === 'completed').length,
      totalBids: auctions.reduce((acc, a) => acc + (a.bids?.length || 0), 0),
      highestBid: Math.max(0, ...auctions.map(a => a.currentHighestBid || 0)),
      totalViews: auctions.reduce((acc, a) => acc + (a.viewsCount || 0), 0)
    };

    res.json({ success: true, data: { stats, auctions } });
  } catch (err) {
    next(err);
  }
};
