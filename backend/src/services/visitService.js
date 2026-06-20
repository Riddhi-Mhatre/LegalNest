import * as VisitModel from '../models/dynamodb/VisitModel.js';
import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as notificationService from './notificationService.js';
import { generateUUID } from '../utils/helpers.js';

const VALID_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled'];

export const scheduleVisit = async ({ buyerId, propertyId, sellerId, date, time }) => {
  const property = await PropertyModel.getProperty(propertyId);
  if (!property) {
    const err = new Error('Property not found');
    err.statusCode = 404;
    throw err;
  }

  const visitId = generateUUID();
  const visit = {
    visitId,
    buyerId,
    propertyId,
    sellerId: sellerId || property.sellerId,
    date,
    time,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  await VisitModel.createVisit(visit);

  // Notify seller
  await notificationService.createNotification(
    visit.sellerId,
    'visit_request',
    'New Visit Request',
    `A buyer has requested a visit for ${property.title} on ${date} at ${time}`,
    { visitId, propertyId, buyerId }
  );

  return visit;
};

export const getBuyerVisits = async (buyerId) => {
  const visits = await VisitModel.getVisitsByBuyer(buyerId);
  const enriched = await Promise.all(
    visits.map(async (v) => {
      const property = await PropertyModel.getProperty(v.propertyId);
      return { ...v, property: property || null };
    })
  );
  return enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateVisit = async (visitId, buyerId, updates) => {
  const visit = await VisitModel.getVisit(visitId);
  if (!visit) {
    const err = new Error('Visit not found');
    err.statusCode = 404;
    throw err;
  }
  if (visit.buyerId !== buyerId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }
  if (updates.status && !VALID_STATUSES.includes(updates.status)) {
    const err = new Error(`Invalid status. Must be: ${VALID_STATUSES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  return VisitModel.updateVisit(visitId, updates);
};

export const cancelVisit = async (visitId, buyerId) => {
  const visit = await VisitModel.getVisit(visitId);
  if (!visit) {
    const err = new Error('Visit not found');
    err.statusCode = 404;
    throw err;
  }
  if (visit.buyerId !== buyerId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }
  if (visit.status === 'completed') {
    const err = new Error('Cannot cancel completed visit');
    err.statusCode = 400;
    throw err;
  }
  return VisitModel.updateVisit(visitId, { status: 'cancelled' });
};
