import * as AuctionModel from '../models/dynamodb/AuctionModel.js';
import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as auctionEngine from '../services/auctionEngine.js';
import { HTTP } from '../utils/constants.js';

// GET /v1/auctions
// Returns auctions enriched with property snapshot (title, images, location, type)
export const listAuctions = async (req, res, next) => {
  try {
    const { status = 'live' } = req.query;

    // Support comma-separated statuses: ?status=live,scheduled
    const statuses = status.split(',').map(s => s.trim()).filter(Boolean);

    const results = await Promise.all(
      statuses.map(s => AuctionModel.getAuctionsByStatus(s))
    );
    const auctions = results.flat();

    // Deduplicate (in case same auction matches multiple status queries)
    const seen = new Set();
    const unique = auctions.filter(a => {
      if (!a || seen.has(a.auctionId)) return false;
      seen.add(a.auctionId);
      return true;
    });

    // Enrich with property snapshot (batch lookup)
    const propertyIds = [...new Set(unique.map(a => a.propertyId).filter(Boolean))];
    const propertyResults = await Promise.allSettled(
      propertyIds.map(id => PropertyModel.getProperty(id))
    );
    const propertyMap = {};
    propertyResults.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        propertyMap[propertyIds[i]] = r.value;
      }
    });

    const enriched = unique
      .map(auction => {
        const prop = propertyMap[auction.propertyId];
        return {
          ...auction,
          property: prop
            ? {
                propertyId: prop.propertyId,
                title: prop.title,
                type: prop.type,
                images: prop.images ?? [],
                city:  prop.city  ?? prop.location?.city  ?? null,
                state: prop.state ?? prop.location?.state ?? null,
                area:  prop.area  ?? prop.areasqft ?? null,
                bedrooms: prop.bedrooms ?? null,
                bathrooms: prop.bathrooms ?? null,
              }
            : null,
          // Carry sellerId from property if not already on auction record
          sellerId: auction.sellerId ?? prop?.sellerId ?? null,
        };
      })
      // Only show auctions linked to a real seller-listed property
      // (system/seed auctions have no property or no sellerId on the property)
      .filter(auction => auction.property !== null && !!auction.sellerId);

    res.json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

// GET /v1/auctions/:id
export const getAuction = async (req, res, next) => {
  try {
    const auction = await AuctionModel.getAuction(req.params.id);
    if (!auction) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'AUC_001', message: 'Auction not found' } });
    }

    // Enrich with property
    let property = null;
    if (auction.propertyId) {
      property = await PropertyModel.getProperty(auction.propertyId);
    }

    res.json({ success: true, data: { ...auction, property: property ?? null } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auctions/:id/bid
export const placeBid = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id: auctionId } = req.params;
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'BID_001', message: 'amount must be a positive number' } });
    }

    const result = await auctionEngine.placeBid(auctionId, userId, amount);
    res.json({ success: true, data: result });
  } catch (err) {
    // Surface business-rule errors as 400 rather than 500
    if (err.message && !err.statusCode) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'BID_002', message: err.message } });
    }
    next(err);
  }
};

// GET /v1/auctions/:id/bids
export const getBidHistory = async (req, res, next) => {
  try {
    const { id: auctionId } = req.params;
    const bids = await auctionEngine.getBidHistory(auctionId);
    // Sort descending by timestamp so latest appears first
    bids.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
    res.json({ success: true, data: bids });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auctions/:id/auto-bid
export const setAutoBid = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id: auctionId } = req.params;
    const { maxAmount } = req.body;

    if (!maxAmount || typeof maxAmount !== 'number' || maxAmount <= 0) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { code: 'BID_003', message: 'maxAmount must be a positive number' } });
    }

    const result = await auctionEngine.setAutoBid(auctionId, userId, maxAmount);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
