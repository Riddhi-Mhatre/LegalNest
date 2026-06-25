import * as InquiryModel from '../models/dynamodb/InquiryModel.js';
import * as chatService from '../services/chatService.js';
import { HTTP } from '../utils/constants.js';

// GET /v1/inquiries/seller  — all inquiries sent to this seller
export const getSellerInquiries = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const inquiries = await InquiryModel.getInquiriesBySeller(sellerId);
    res.json({ success: true, data: inquiries });
  } catch (err) {
    next(err);
  }
};

// GET /v1/inquiries/buyer  — all inquiries sent by this buyer
export const getBuyerInquiries = async (req, res, next) => {
  try {
    const buyerId = req.user.userId;
    const inquiries = await InquiryModel.getInquiriesByBuyer(buyerId);
    res.json({ success: true, data: inquiries });
  } catch (err) {
    next(err);
  }
};

// POST /v1/inquiries/:inquiryId/accept  — seller accepts, creates a chat room
export const acceptInquiry = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { inquiryId } = req.params;

    const inquiry = await InquiryModel.getInquiry(inquiryId);
    if (!inquiry) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { message: 'Inquiry not found' } });
    }
    if (inquiry.sellerId !== sellerId) {
      return res.status(HTTP.FORBIDDEN).json({ success: false, error: { message: 'Access denied' } });
    }
    if (inquiry.status !== 'pending') {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { message: 'Inquiry is no longer pending' } });
    }

    // Create a chat room for these two users
    const room = await chatService.createChatRoom(
      inquiry.buyerId,
      sellerId,
      inquiry.propertyId,
      inquiry.propertyTitle,
      inquiry.buyerName,
      inquiryId
    );

    // Update inquiry status
    await InquiryModel.updateInquiryStatus(inquiryId, 'accepted', room.roomId);

    res.json({ success: true, data: { inquiry: { ...inquiry, status: 'accepted', roomId: room.roomId }, room } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/inquiries/:inquiryId/reject  — seller rejects
export const rejectInquiry = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { inquiryId } = req.params;

    const inquiry = await InquiryModel.getInquiry(inquiryId);
    if (!inquiry) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: { message: 'Inquiry not found' } });
    }
    if (inquiry.sellerId !== sellerId) {
      return res.status(HTTP.FORBIDDEN).json({ success: false, error: { message: 'Access denied' } });
    }
    if (inquiry.status !== 'pending') {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: { message: 'Inquiry is no longer pending' } });
    }

    await InquiryModel.updateInquiryStatus(inquiryId, 'rejected');
    res.json({ success: true, data: { inquiryId, status: 'rejected' } });
  } catch (err) {
    next(err);
  }
};
