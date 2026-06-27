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
    const { startingPrice, reservePrice, bidIncrement, startTime, endTime } = req.body;

    const property = await PropertyModel.getProperty(propertyId);
    if (!property) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'PROP_001', message: 'Property not found' } });
    }
    if (property.sellerId !== sellerId) {
      return res.status(HTTP.FORBIDDEN).json({ success: false, error: { code: 'AUTH_003', message: 'Access denied' } });
    }
    if (property.status !== 'approved') {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_002', message: 'Property must be approved to schedule auction' } });
    }

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_003', message: 'Invalid startTime or endTime' } });
    }
    if (end <= start) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_004', message: 'endTime must be after startTime' } });
    }

    const sp = Number(startingPrice);
    const rp = Number(reservePrice);
    const bi = Number(bidIncrement);

    if (!sp || !rp || !bi || sp <= 0 || rp <= 0 || bi <= 0) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_005', message: 'startingPrice, reservePrice and bidIncrement must be positive numbers' } });
    }
    if (rp < sp) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_006', message: 'reservePrice must be >= startingPrice' } });
    }

    // Check if property already has an active auction
    const existing = await AuctionModel.getAuctionByPropertyId(propertyId);
    if (existing && (existing.status === 'scheduled' || existing.status === 'live')) {
      return res.status(HTTP.CONFLICT).json({ success: false, error: { code: 'AUC_007', message: 'This property already has an active or scheduled auction' } });
    }

    const auctionId = generateUUID();
    const now = new Date().toISOString();

    const auction = await AuctionModel.createAuction({
      auctionId,
      propertyId,
      sellerId,
      startingPrice: sp,
      reservePrice: rp,
      bidIncrement: bi,          // ✅ FIX: was previously omitted
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      status: 'scheduled',
      currentHighestBid: sp,
      highestBidderId: null,
      extensionCount: 0,
      totalBids: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Flag the property so the dashboard doesn't re-offer it for a new auction
    await PropertyModel.updateProperty(propertyId, {
      isAuctionRequested: true,
      updatedAt: now,
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

    // Use GSI instead of multi-status scan
    const auction = await AuctionModel.getAuctionByPropertyId(propertyId);
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

    const auction = await AuctionModel.getAuctionByPropertyId(propertyId);
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
      bidderName: bidderMap[b.bidderId]?.name || 'Anonymous Bidder',
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
      scheduled: auctions.filter(a => a.status === 'scheduled').length,
      completed: auctions.filter(a => a.status === 'completed' || a.status === 'ended').length,
      totalBids: auctions.reduce((acc, a) => acc + (a.bids?.length || 0), 0),
      highestBid: Math.max(0, ...auctions.map(a => a.currentHighestBid || 0)),
      totalViews: auctions.reduce((acc, a) => acc + (a.viewsCount || 0), 0),
    };

    res.json({ success: true, data: { stats, auctions } });
  } catch (err) {
    next(err);
  }
};

// DELETE /v1/seller/properties/:id/auction
export const cancelAuction = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { id: propertyId } = req.params;

    const property = await PropertyModel.getProperty(propertyId);
    if (!property || property.sellerId !== sellerId) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'PROP_001', message: 'Property not found' } });
    }

    const auction = await AuctionModel.getAuctionByPropertyId(propertyId);
    if (!auction) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'AUC_001', message: 'No auction found for this property' } });
    }
    if (auction.status !== 'scheduled') {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_008', message: 'Only scheduled auctions can be cancelled' } });
    }

    await AuctionModel.updateAuction(auction.auctionId, {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });

    // Allow seller to create a new auction for this property
    await PropertyModel.updateProperty(propertyId, {
      isAuctionRequested: false,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Auction cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /v1/seller/properties/:id/auction/early-close
export const earlyCloseAuction = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { id: propertyId } = req.params;

    const property = await PropertyModel.getProperty(propertyId);
    if (!property || property.sellerId !== sellerId) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'PROP_001', message: 'Property not found' } });
    }

    const auction = await AuctionModel.getAuctionByPropertyId(propertyId);
    if (!auction) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'AUC_001', message: 'No auction found for this property' } });
    }
    if (auction.status !== 'live') {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_009', message: 'Only live auctions can be closed early' } });
    }
    if ((auction.currentHighestBid || 0) < auction.reservePrice) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'AUC_010', message: 'Reserve price not met' } });
    }

    // Set end time to now + 15 mins
    const newEndTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await AuctionModel.updateAuction(auction.auctionId, {
      endTime: newEndTime,
      updatedAt: new Date().toISOString(),
    });

    // Notify clients about the time update
    import('../websocket/server.js').then(({ io }) => {
      if (io) {
        io.to(`auction_${auction.auctionId}`).emit('auction_time_updated', {
          newEndTime: new Date(newEndTime).getTime(),
          message: 'The seller has initiated early closure. The auction will end in 15 minutes.'
        });
      }
    }).catch(console.error);

    res.json({ success: true, message: 'Auction scheduled to close early', data: { newEndTime } });
  } catch (err) {
    next(err);
  }
};

