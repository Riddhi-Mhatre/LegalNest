import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_AUCTIONS_TABLE;

// ── Basic CRUD ────────────────────────────────────────────────────────────────

export const getAuction = (auctionId) =>
  dynamo.getItem(TABLE, { auctionId });

export const createAuction = (auction) => dynamo.putItem(TABLE, auction);

export const updateAuction = (auctionId, updates) =>
  dynamo.updateItem(TABLE, { auctionId }, updates);

// ── Status-based queries (status-index GSI — created at table provisioning) ──

export const getAuctionsByStatus = (status) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'status-index',
    keyCondition: '#status = :status',
    expressionNames: { '#status': 'status' },
    expressionValues: { ':status': status },
  });

export const getActiveAuctions = () => getAuctionsByStatus('live');

// ── Seller-based query ────────────────────────────────────────────────────────
/**
 * Returns all auctions belonging to a seller.
 * Uses a scan + filter — safe on existing tables that don't have sellerId-index yet.
 * The dynamoTables provisioner adds sellerId-index for new tables going forward.
 */
export const getAuctionsBySeller = async (sellerId) => {
  const all = await dynamo.scanItems(TABLE);
  return all.filter(a => a.sellerId === sellerId);
};

// ── Property-based query ──────────────────────────────────────────────────────
/**
 * Returns the most recent auction for a given property, or null.
 * Uses a scan + filter — safe on existing tables that don't have propertyId-index yet.
 * The dynamoTables provisioner adds propertyId-index for new tables going forward.
 */
export const getAuctionByPropertyId = async (propertyId) => {
  const all = await dynamo.scanItems(TABLE);
  const items = all.filter(a => a.propertyId === propertyId);
  if (!items || items.length === 0) return null;
  // Return the most recently created one
  return items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))[0];
};
