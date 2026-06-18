import * as UserModel from '../models/dynamodb/UserModel.js';
import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as AuctionModel from '../models/dynamodb/AuctionModel.js';
import * as TransactionModel from '../models/dynamodb/TransactionModel.js';
import { generateUUID } from '../utils/helpers.js';
import { HTTP } from '../utils/constants.js';

// GET /v1/admin/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const [users, pendingProps, activeAuctions] = await Promise.all([
      UserModel.getAllUsers(),
      PropertyModel.queryByVerificationStatus('pending'),
      AuctionModel.getAuctionsByStatus('live'),
    ]);

    const unverifiedUsers = users.filter(u => !u.isVerified).length;

    res.json({
      success: true,
      data: {
        totalUsers: users.length,
        pendingVerifications: unverifiedUsers,
        pendingProperties: pendingProps.length,
        activeAuctions: activeAuctions.length,
        totalRevenue: 0, // payment aggregation TBD
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /v1/admin/users
export const listUsers = async (req, res, next) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/admin/users/:userId/verify
export const verifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await UserModel.updateUser(userId, { isVerified: true, verifiedAt: new Date().toISOString() });
    res.json({ success: true, data: { message: 'User verified' } });
  } catch (err) {
    next(err);
  }
};

// GET /v1/admin/properties/pending
export const getPendingProperties = async (req, res, next) => {
  try {
    const properties = await PropertyModel.queryByVerificationStatus('pending');
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/admin/properties/:id/approve
export const approveProperty = async (req, res, next) => {
  try {
    await PropertyModel.updateProperty(req.params.id, {
      verificationStatus: 'approved',
      status: 'approved',
      verifiedAt: new Date().toISOString(),
    });
    res.json({ success: true, data: { message: 'Property approved' } });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/admin/properties/:id/reject
export const rejectProperty = async (req, res, next) => {
  try {
    const { reason } = req.body;
    await PropertyModel.updateProperty(req.params.id, {
      verificationStatus: 'rejected',
      status: 'rejected',
      rejectionReason: reason,
    });
    res.json({ success: true, data: { message: 'Property rejected' } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/admin/auctions
export const scheduleAuction = async (req, res, next) => {
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
export const approveInterest = async (req, res, next) => {
  try {
    const { interestId } = req.params;
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
