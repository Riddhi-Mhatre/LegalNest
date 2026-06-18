import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_AUCTIONS_TABLE;

export const getAuction = (auctionId) =>
  dynamo.getItem(TABLE, { auctionId });

export const createAuction = (auction) => dynamo.putItem(TABLE, auction);

export const updateAuction = (auctionId, updates) =>
  dynamo.updateItem(TABLE, { auctionId }, updates);

export const getAuctionsByStatus = (status) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'status-index',
    keyCondition: '#status = :status',
    expressionNames: { '#status': 'status' },
    expressionValues: { ':status': status },
  });

export const getActiveAuctions = () => getAuctionsByStatus('live');

export const getAuctionsBySeller = async (sellerId) => {
  const all = await dynamo.scanItems(TABLE);
  return all.filter(a => a.sellerId === sellerId);
};
