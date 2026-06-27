import { generateUUID } from '../utils/helpers.js';
import * as dynamoService from './dynamoService.js';
import { env } from '../config/env.js';

export const getUserRooms = async (userId) => {
  // Query both GSIs (buyerId-index and sellerId-index) and merge
  const [asBuyer, asSeller] = await Promise.all([
    dynamoService.queryItems({
      tableName: env.DYNAMODB_CHAT_ROOMS_TABLE,
      indexName: 'buyerId-index',
      keyCondition: 'buyerId = :uid',
      expressionValues: { ':uid': userId },
    }),
    dynamoService.queryItems({
      tableName: env.DYNAMODB_CHAT_ROOMS_TABLE,
      indexName: 'sellerId-index',
      keyCondition: 'sellerId = :uid',
      expressionValues: { ':uid': userId },
    }),
  ]);
  // Deduplicate by roomId and sort newest first
  const seen = new Set();
  return [...asBuyer, ...asSeller]
    .filter(r => { if (seen.has(r.roomId)) return false; seen.add(r.roomId); return true; })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getRoom = async (roomId) => {
  return dynamoService.getItem(env.DYNAMODB_CHAT_ROOMS_TABLE, { roomId });
};

export const getMessages = async (roomId) => {
  const items = await dynamoService.queryItems({
    tableName: env.DYNAMODB_MESSAGES_TABLE,
    keyCondition: 'roomId = :rid',
    expressionValues: { ':rid': roomId },
  });
  return items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

export const saveMessage = async (roomId, senderId, content, type, payload) => {
  const messageId = generateUUID();
  const message = {
    roomId,
    messageId,
    senderId,
    content,
    timestamp: new Date().toISOString(),
    isRead: false,
    ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 3600, // 90 days TTL
  };
  if (type) message.type = type;
  if (payload) message.payload = payload;
  await dynamoService.putItem(env.DYNAMODB_MESSAGES_TABLE, message);
  return message;
};

export const markMessagesRead = async (roomId, userId) => {
  // TODO: batch update isRead for all messages in room for this user
};

export const createChatRoom = async (buyerId, sellerId, propertyId, propertyTitle, buyerName, inquiryId) => {
  const roomId = generateUUID();
  const room = {
    roomId,
    buyerId,
    sellerId,
    propertyId: propertyId || null,
    propertyTitle: propertyTitle || null,
    buyerName: buyerName || null,
    inquiryId: inquiryId || null,
    createdAt: new Date().toISOString(),
    isActive: true,
    dealStatus: null,
    meetProposal: null,
    meetConfirmedDate: null,
    buyerPaid: false,
    sellerPaid: false,
  };
  await dynamoService.putItem(env.DYNAMODB_CHAT_ROOMS_TABLE, room);
  return room;
};

/**
 * Creates a dedicated auction-winner chat room between the winning buyer and the seller.
 * Seeds the room with a congratulatory system message so the conversation starts immediately.
 *
 * @param {string} buyerId   - userId of the winning bidder
 * @param {string} sellerId  - userId of the property seller
 * @param {string} propertyId
 * @param {string} propertyTitle
 * @param {string} buyerName - display name of the winner
 * @param {string} auctionId
 * @param {number} winningBid
 * @returns {Promise<object>} the newly created room
 */
export const createAuctionWinnerRoom = async (
  buyerId, sellerId, propertyId, propertyTitle, buyerName, auctionId, winningBid
) => {
  const roomId = generateUUID();
  const now = new Date().toISOString();

  const room = {
    roomId,
    buyerId,
    sellerId,
    propertyId: propertyId || null,
    propertyTitle: propertyTitle || null,
    buyerName: buyerName || null,
    inquiryId: null,
    auctionId: auctionId || null,
    source: 'auction',           // distinguishes from inquiry-based rooms
    createdAt: now,
    isActive: true,
    dealStatus: null,
    meetProposal: null,
    meetConfirmedDate: null,
    buyerPaid: false,
    sellerPaid: false,
  };

  await dynamoService.putItem(env.DYNAMODB_CHAT_ROOMS_TABLE, room);

  // Seed the congratulatory system message
  const winningBidFormatted = Number(winningBid).toLocaleString('en-IN');
  await saveMessage(
    roomId,
    'system',
    `🎉 Congratulations ${buyerName || 'Winner'}! You have won the auction for "${propertyTitle || 'this property'}" with a winning bid of ₹${winningBidFormatted}. Please use this chat to discuss further details and arrange an offline meeting with the seller.`,
    'auction_winner',
    { auctionId, winningBid, propertyId, propertyTitle }
  );

  return room;
};

// ─── Deal State Helpers ───────────────────────────────────────────────────────

/**
 * Update arbitrary fields on a chat room item.
 */
export const updateRoomDealState = async (roomId, fields) => {
  return dynamoService.updateItem(
    env.DYNAMODB_CHAT_ROOMS_TABLE,
    { roomId },
    fields
  );
};

/**
 * Save a system/deal message to the messages table.
 * type: 'deal_request' | 'deal_response' | 'meet_proposal' | 'meet_confirmation' | 'payment_buyer' | 'payment_seller' | 'deal_closed' | 'file'
 */
export const saveDealSystemMessage = async (roomId, type, payload, content) => {
  return saveMessage(roomId, 'system', content, type, payload);
};
