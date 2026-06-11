import { Request, Response, NextFunction } from 'express';
import * as UserModel from '../models/dynamodb/UserModel';
import * as PropertyModel from '../models/dynamodb/PropertyModel';
import * as AuctionModel from '../models/dynamodb/AuctionModel';
import * as TransactionModel from '../models/dynamodb/TransactionModel';
import { generateUUID } from '../utils/helpers';
import { HTTP } from '../utils/constants';

// GET /v1/admin/dashboard
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: aggregate real stats from DynamoDB
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        pendingVerifications: 0,
        activeAuctions: 0,
        totalRevenue: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /v1/admin/users
export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/admin/users/:userId/verify
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    await UserModel.updateUser(userId, { isVerified: true, verifiedAt: new Date().toISOString() });
    res.json({ success: true, data: { message: 'User verified' } });
  } catch (err) {
    next(err);
  }
};

// GET /v1/admin/properties/pending
export const getPendingProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const properties = await PropertyModel.queryByVerificationStatus('pending');
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/admin/properties/:id/approve
export const approveProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await PropertyModel.updateProperty(req.params.id, {
      verificationStatus: 'verified',
      verifiedAt: new Date().toISOString(),
    });
    res.json({ success: true, data: { message: 'Property approved' } });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/admin/properties/:id/reject
export const rejectProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    await PropertyModel.updateProperty(req.params.id, {
      verificationStatus: 'rejected',
      rejectionReason: reason,
    });
    res.json({ success: true, data: { message: 'Property rejected' } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/admin/auctions
export const scheduleAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctionId = generateUUID();
    const auction = await AuctionModel.createAuction({
      auctionId,
      ...req.body,
      status: 'scheduled',
      currentHighestBid: req.body.startingPrice,
      extensionCount: 0,
      createdAt: new Date().toISOString(),
    });
    res.status(HTTP.CREATED).json({ success: true, data: auction });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/admin/interests/:interestId/approve
export const approveInterest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { interestId } = req.params;
    // Unlock chat between buyer and seller
    const transactionId = generateUUID();
    const roomId = generateUUID();
    await TransactionModel.createTransaction({
      transactionId,
      interestId,
      status: 'chat_unlocked',
      createdAt: new Date().toISOString(),
    });
    res.json({ success: true, data: { message: 'Interest approved, chat unlocked', transactionId, roomId } });
  } catch (err) {
    next(err);
  }
};
