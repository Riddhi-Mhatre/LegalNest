import { generateUUID } from '../utils/helpers';
import * as dynamoService from './dynamoService';
import { env } from '../config/env';

export const getUserRooms = async (userId: string) => {
  return dynamoService.queryItems({
    tableName: env.DYNAMODB_CHAT_ROOMS_TABLE,
    indexName: 'userId-index',
    keyCondition: 'buyerId = :uid OR sellerId = :uid',
    expressionValues: { ':uid': userId },
  });
};

export const getMessages = async (roomId: string) => {
  return dynamoService.queryItems({
    tableName: env.DYNAMODB_MESSAGES_TABLE,
    keyCondition: 'roomId = :rid',
    expressionValues: { ':rid': roomId },
  });
};

export const saveMessage = async (roomId: string, senderId: string, content: string) => {
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

export const markMessagesRead = async (roomId: string, userId: string) => {
  // TODO: batch update isRead for all messages in room for this user
};

export const createChatRoom = async (buyerId: string, sellerId: string, transactionId: string) => {
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
