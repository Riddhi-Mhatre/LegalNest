import { Request, Response, NextFunction } from 'express';
import * as AuctionModel from '../models/dynamodb/AuctionModel';
import * as auctionEngine from '../services/auctionEngine';
import { HTTP } from '../utils/constants';

// GET /v1/auctions
export const listAuctions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status = 'live' } = req.query;
    const auctions = await AuctionModel.getAuctionsByStatus(status as string);
    res.json({ success: true, data: auctions });
  } catch (err) {
    next(err);
  }
};

// GET /v1/auctions/:id
export const getAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auction = await AuctionModel.getAuction(req.params.id);
    if (!auction) return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'AUC_001', message: 'Auction not found' } });
    res.json({ success: true, data: auction });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auctions/:id/bid
export const placeBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id: auctionId } = req.params;
    const { amount } = req.body;
    const result = await auctionEngine.placeBid(auctionId, userId, amount);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// GET /v1/auctions/:id/bids
export const getBidHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: auctionId } = req.params;
    const bids = await auctionEngine.getBidHistory(auctionId);
    res.json({ success: true, data: bids });
  } catch (err) {
    next(err);
  }
};

// POST /v1/auctions/:id/auto-bid
export const setAutoBid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id: auctionId } = req.params;
    const { maxAmount } = req.body;
    const result = await auctionEngine.setAutoBid(auctionId, userId, maxAmount);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
