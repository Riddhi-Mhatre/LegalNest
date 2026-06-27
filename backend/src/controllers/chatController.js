import * as chatService from '../services/chatService.js';
import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as PurchaseModel from '../models/dynamodb/PurchaseModel.js';
import { generateUUID } from '../utils/helpers.js';
import { HTTP } from '../utils/constants.js';
import { createNotification } from '../services/notificationService.js';

// GET /v1/chat/rooms
export const getRooms = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rooms = await chatService.getUserRooms(userId);
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
};

// GET /v1/chat/rooms/:roomId/messages
export const getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const messages = await chatService.getMessages(roomId);
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

// POST /v1/chat/rooms/:roomId/messages
export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const { roomId } = req.params;
    const { content, type, payload } = req.body;
    
    const room = await chatService.getRoom(roomId);
    if (!room) {
      return res.status(HTTP.NOT_FOUND).json({ success: false, error: 'Room not found' });
    }

    const message = await chatService.saveMessage(roomId, senderId, content, type, payload);
    
    const recipientId = room.buyerId === senderId ? room.sellerId : room.buyerId;
    if (recipientId) {
      await createNotification(recipientId, 'chat_notification', 'New Chat Message', `You received a new message regarding ${room.propertyTitle || 'a property'}`, { roomId, messageId: message.messageId });
    }

    res.status(HTTP.CREATED).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/chat/rooms/:roomId/read
export const markRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { roomId } = req.params;
    await chatService.markMessagesRead(roomId, userId);
    res.json({ success: true, data: { message: 'Messages marked as read' } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/chat/rooms/:roomId/deal/request  (buyer only)
export const dealRequest = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    await chatService.updateRoomDealState(roomId, { dealStatus: 'requested', dealRequestedAt: new Date().toISOString() });
    const msg = await chatService.saveDealSystemMessage(
      roomId,
      'deal_request',
      {},
      'Buyer has requested to close the deal.'
    );
    res.status(HTTP.CREATED).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

// POST /v1/chat/rooms/:roomId/deal/respond  (seller only) body: { action: 'accept'|'reject' }
export const dealRespond = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { action } = req.body;
    if (!['accept', 'reject'].includes(action)) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: 'action must be accept or reject' });
    }
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    await chatService.updateRoomDealState(roomId, { dealStatus: newStatus });
    const msg = await chatService.saveDealSystemMessage(
      roomId,
      'deal_response',
      { action },
      action === 'accept' ? 'Seller accepted the deal request.' : 'Seller declined the deal request.'
    );
    res.json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

// POST /v1/chat/rooms/:roomId/meet/propose  (seller only)
// body: { primaryDate, primaryTime, alt1Date, alt1Time, alt2Date, alt2Time, notes }
export const proposeMeet = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { primaryDate, primaryTime, alt1Date, alt1Time, alt2Date, alt2Time, notes } = req.body;
    const proposal = { primaryDate, primaryTime, alt1Date, alt1Time, alt2Date, alt2Time, notes, proposedAt: new Date().toISOString() };
    await chatService.updateRoomDealState(roomId, { meetProposal: proposal, dealStatus: 'meet_proposed' });
    const msg = await chatService.saveDealSystemMessage(
      roomId,
      'meet_proposal',
      proposal,
      'Seller proposed offline meeting dates.'
    );
    res.status(HTTP.CREATED).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

// POST /v1/chat/rooms/:roomId/meet/confirm  (buyer only)  body: { chosenDate, chosenTime }
export const confirmMeet = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { chosenDate, chosenTime } = req.body;
    await chatService.updateRoomDealState(roomId, {
      meetConfirmedDate: chosenDate,
      meetConfirmedTime: chosenTime,
      dealStatus: 'meet_confirmed',
    });
    const msg = await chatService.saveDealSystemMessage(
      roomId,
      'meet_confirmation',
      { chosenDate, chosenTime },
      `Buyer confirmed meeting on ${chosenDate} at ${chosenTime}.`
    );
    res.status(HTTP.CREATED).json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

// POST /v1/chat/rooms/:roomId/pay  body: { role: 'buyer'|'seller' }
export const payDealFee = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { role } = req.body;
    if (!['buyer', 'seller'].includes(role)) {
      return res.status(HTTP.BAD_REQUEST).json({ success: false, error: 'role must be buyer or seller' });
    }
    const field = role === 'buyer' ? 'buyerPaid' : 'sellerPaid';
    await chatService.updateRoomDealState(roomId, { [field]: true });

    // Check if BOTH have paid — if so, mark deal closed
    const room = await chatService.getRoom(roomId);
    let msg;
    if (room && room.buyerPaid && room.sellerPaid) {
      await chatService.updateRoomDealState(roomId, { dealStatus: 'closed', isActive: false });

      if (room.propertyId) {
        await PropertyModel.updateProperty(room.propertyId, { status: 'sold' });
        await PurchaseModel.createPurchase({
          purchaseId: generateUUID(),
          propertyId: room.propertyId,
          buyerId: room.buyerId,
          sellerId: room.sellerId,
          propertyTitle: room.propertyTitle,
          amount: 0, // Demo value
          date: new Date().toISOString()
        });
      }

      await createNotification(room.buyerId, 'deal_finalized', 'Deal Finalized', `Congratulations! The deal for ${room.propertyTitle} has been finalized.`, { propertyId: room.propertyId });
      await createNotification(room.sellerId, 'deal_finalized', 'Deal Finalized', `Congratulations! The deal for ${room.propertyTitle} has been finalized.`, { propertyId: room.propertyId });

      msg = await chatService.saveDealSystemMessage(roomId, 'deal_closed', {}, '🎉 Deal successfully closed! Both parties have paid the platform fee.');
    } else {
      const msgType = role === 'buyer' ? 'payment_buyer' : 'payment_seller';
      const msgContent = role === 'buyer' ? 'Buyer has paid the platform fee.' : 'Seller has paid the platform fee.';
      msg = await chatService.saveDealSystemMessage(roomId, msgType, { role }, msgContent);
    }
    res.json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};
