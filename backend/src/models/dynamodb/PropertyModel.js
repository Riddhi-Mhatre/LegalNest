import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_PROPERTIES_TABLE;

export const getProperty = (propertyId) =>
  dynamo.getItem(TABLE, { propertyId });

export const createProperty = (property) => dynamo.putItem(TABLE, property);

export const updateProperty = (propertyId, updates) =>
  dynamo.updateItem(TABLE, { propertyId }, updates);

export const deleteProperty = (propertyId) =>
  dynamo.deleteItem(TABLE, { propertyId });

export const queryBySeller = async (sellerId) => {
  return dynamo.query({
    TableName: TABLE,
    IndexName: 'sellerId-index',
    KeyConditionExpression: 'sellerId = :sellerId',
    ExpressionAttributeValues: {
      ':sellerId': sellerId,
    },
  });
};

export const queryByVerificationStatus = (status) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'verificationStatus-index',
    keyCondition: 'verificationStatus = :status',
    expressionValues: { ':status': status },
  });

export const queryByGeohash = (geohash) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'geohash-index',
    keyCondition: 'begins_with(geohash, :gh)',
    expressionValues: { ':gh': geohash },
  });

export const queryProperties = async (filters) => {
  // Scan with filters – for production, use GSIs + ElasticSearch
  const items = await dynamo.scanItems(TABLE);
  return items.filter(p => {
    if (filters.type && p.type !== filters.type) return false;
    const price = p.salePrice ?? p.price ?? 0;
    if (filters.minPrice && price < filters.minPrice) return false;
    if (filters.maxPrice && price > filters.maxPrice) return false;

    // Status filter: accept 'approved' status OR 'verified' verificationStatus
    // so both auto-approved seller properties and legacy demo properties appear
    if (filters.status) {
      if (p.status === 'sold') return false;
      const isApprovedByStatus         = p.status === 'approved';
      const isApprovedByVerification   = p.verificationStatus === 'verified' || p.verificationStatus === 'approved';
      if (!isApprovedByStatus && !isApprovedByVerification) return false;
    }

    return true;
  });
};

export const addInterest = async (propertyId, buyerId) => {
  const property = await getProperty(propertyId);
  if (!property) throw new Error('Property not found');
  const buyers = new Set(property.interestedBuyers ?? []);
  buyers.add(buyerId);
  return updateProperty(propertyId, { interestedBuyers: Array.from(buyers) });
};

export const addFavorite = async (propertyId, buyerId) => {
  // Store in User record instead – placeholder
  return { propertyId, buyerId };
};
