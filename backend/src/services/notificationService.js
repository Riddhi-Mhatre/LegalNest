import { generateUUID } from '../utils/helpers.js';
import * as dynamoService from './dynamoService.js';
import { env } from '../config/env.js';

export const createNotification = async (userId, type, title, body, metadata) => {
  const notificationId = generateUUID();
  const notification = {
    userId,
    notificationId,
    type,
    title,
    body,
    metadata,
    isRead: false,
    createdAt: new Date().toISOString(),
    ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 3600, // 30 days TTL
  };
  await dynamoService.putItem(env.DYNAMODB_NOTIFICATIONS_TABLE, notification);
  return notification;
};

export const getUserNotifications = async (userId) => {
  return dynamoService.queryItems({
    tableName: env.DYNAMODB_NOTIFICATIONS_TABLE,
    keyCondition: 'userId = :uid',
    expressionValues: { ':uid': userId },
  });
};
