import * as dynamoService from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_INQUIRIES_TABLE;

export const createInquiry = async (inquiry) => {
  return dynamoService.putItem(TABLE, inquiry);
};

export const getInquiry = async (inquiryId) => {
  return dynamoService.getItem(TABLE, { inquiryId });
};

export const getInquiriesBySeller = async (sellerId) => {
  const all = await dynamoService.scanItems(TABLE);
  return all.filter(i => i.sellerId === sellerId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getInquiriesByBuyer = async (buyerId) => {
  const all = await dynamoService.scanItems(TABLE);
  return all.filter(i => i.buyerId === buyerId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getPendingInquiriesForProperty = async (propertyId, buyerId) => {
  const all = await dynamoService.scanItems(TABLE);
  return all.filter(i => i.propertyId === propertyId && i.buyerId === buyerId && i.status === 'pending');
};

export const updateInquiryStatus = async (inquiryId, status, roomId = null) => {
  const updates = { status };
  if (roomId) updates.roomId = roomId;
  return dynamoService.updateItem(TABLE, { inquiryId }, updates);
};
