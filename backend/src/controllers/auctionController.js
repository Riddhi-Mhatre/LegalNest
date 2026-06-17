import * as AuctionModel from '../models/dynamodb/AuctionModel.js';
import * as auctionEngine from '../services/auctionEngine.js';
import { HTTP } from '../utils/constants.js';

// GET /v1/auctions
export const listAuctions = async (req, res, next) => {
  try {
    const { status = 'live' } = req.query;
    const auctions = await AuctionModel.getAuctionsByStatus(status);
    res.json({ success: true, data: auctions });
  } catch (err) {
    next(err);
  }
};

// GET /v1/auctions/:id
export const getAuction = async (req, res, next) => {
  try {
    const auction = await AuctionModel.getAuction(req.params.id);
    if (!auction) return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'AUC_001', message: 'Auction not found' } });
    res.json({ success: true, data: auction });
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
    const result = await auctionEngine.placeBid(auctionId, userId, amount);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /v1/auctions/:id/bids
export const getBidHistory = async (req, res, next) => {
  try {
    const { id: auctionId } = req.params;
    const bids = await auctionEngine.getBidHistory(auctionId);
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
    const result = await auctionEngine.setAutoBid(auctionId, userId, maxAmount);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
