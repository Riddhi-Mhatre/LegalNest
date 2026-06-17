import { generateUUID } from '../utils/helpers.js';
import * as dynamoService from './dynamoService.js';
import { env } from '../config/env.js';

export const getUserRooms = async (userId) => {
  return dynamoService.queryItems({
    tableName: env.DYNAMODB_CHAT_ROOMS_TABLE,
    indexName: 'userId-index',
    keyCondition: 'buyerId = :uid OR sellerId = :uid',
    expressionValues: { ':uid': userId },
  });
};

export const getMessages = async (roomId) => {
  return dynamoService.queryItems({
    tableName: env.DYNAMODB_MESSAGES_TABLE,
    keyCondition: 'roomId = :rid',
    expressionValues: { ':rid': roomId },
  });
};

export const saveMessage = async (roomId, senderId, content) => {
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
  await dynamoService.putItem(env.DYNAMODB_MESSAGES_TABLE, message);
  return message;
};

export const markMessagesRead = async (roomId, userId) => {
  // TODO: batch update isRead for all messages in room for this user
};

export const createChatRoom = async (buyerId, sellerId, transactionId) => {
  const roomId = generateUUID();
  const room = {
    roomId,
    buyerId,
    sellerId,
    transactionId,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
  await dynamoService.putItem(env.DYNAMODB_CHAT_ROOMS_TABLE, room);
  return room;
};
