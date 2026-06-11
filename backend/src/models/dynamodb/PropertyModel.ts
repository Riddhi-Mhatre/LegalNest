import * as dynamo from '../../services/dynamoService';
import { env } from '../../config/env';
import { Property } from '../entities/Property';

const TABLE = env.DYNAMODB_PROPERTIES_TABLE;

export const getProperty = (propertyId: string) =>
  dynamo.getItem(TABLE, { propertyId }) as Promise<Property | undefined>;

export const createProperty = (property: Property) => dynamo.putItem(TABLE, property) as Promise<Property>;

export const updateProperty = (propertyId: string, updates: Partial<Property>) =>
  dynamo.updateItem(TABLE, { propertyId }, updates);

export const deleteProperty = (propertyId: string) =>
  dynamo.deleteItem(TABLE, { propertyId });

export const queryBySeller = (sellerId: string) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'sellerId-index',
    keyCondition: 'sellerId = :sid',
    expressionValues: { ':sid': sellerId },
  });

export const queryByVerificationStatus = (status: string) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'verificationStatus-index',
    keyCondition: 'verificationStatus = :status',
    expressionValues: { ':status': status },
  });

export const queryByGeohash = (geohash: string) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'geohash-index',
    keyCondition: 'begins_with(geohash, :gh)',
    expressionValues: { ':gh': geohash },
  });

export const queryProperties = async (filters: {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  geohash?: string;
  verificationStatus?: string;
}): Promise<Property[]> => {
  // Scan with filters – for production, use GSIs + ElasticSearch
  const items = await dynamo.scanItems(TABLE);
  return (items as Property[]).filter(p => {
    if (filters.type && p.type !== filters.type) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.verificationStatus && p.verificationStatus !== filters.verificationStatus) return false;
    return true;
  });
};

export const addInterest = async (propertyId: string, buyerId: string) => {
  const property = await getProperty(propertyId);
  if (!property) throw new Error('Property not found');
  const buyers = new Set(property.interestedBuyers ?? []);
  buyers.add(buyerId);
  return updateProperty(propertyId, { interestedBuyers: Array.from(buyers) });
};

export const addFavorite = async (propertyId: string, buyerId: string) => {
  // Store in User record instead – placeholder
  return { propertyId, buyerId };
};
