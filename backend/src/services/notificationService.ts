import { generateUUID } from '../utils/helpers';
import * as dynamoService from './dynamoService';
import { env } from '../config/env';

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata?: Record<string, any>
) => {
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

export const getUserNotifications = async (userId: string) => {
  return dynamoService.queryItems({
    tableName: env.DYNAMODB_NOTIFICATIONS_TABLE,
    keyCondition: 'userId = :uid',
    expressionValues: { ':uid': userId },
  });
};
