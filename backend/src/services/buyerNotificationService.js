import * as notificationService from './notificationService.js';
import * as dynamoService from './dynamoService.js';
import { env } from '../config/env.js';

export const getNotifications = async (userId, { limit, type } = {}) => {
  const notifications = await notificationService.getUserNotifications(userId);
  let result = notifications;
  if (type) {
    result = result.filter(n => n.type === type);
  }
  // Sort newest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (limit) {
    result = result.slice(0, limit);
  }
  return result;
};

export const markNotificationRead = async (userId, notificationId) => {
  const notification = await dynamoService.getItem(env.DYNAMODB_NOTIFICATIONS_TABLE, {
    userId,
    notificationId,
  });
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  if (notification.userId !== userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }
  return dynamoService.updateItem(
    env.DYNAMODB_NOTIFICATIONS_TABLE,
    { userId, notificationId },
    { isRead: true, readAt: new Date().toISOString() }
  );
};

export const deleteNotification = async (userId, notificationId) => {
  const notification = await dynamoService.getItem(env.DYNAMODB_NOTIFICATIONS_TABLE, {
    userId,
    notificationId,
  });
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  if (notification.userId !== userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }
  return dynamoService.deleteItem(env.DYNAMODB_NOTIFICATIONS_TABLE, { userId, notificationId });
};

export const createAuctionAlert = async (userId, auctionId, propertyTitle, type, message) => {
  return notificationService.createNotification(
    userId,
    type,
    type === 'outbid' ? 'You have been outbid!' : 'Auction Alert',
    message,
    { auctionId, propertyTitle }
  );
};
