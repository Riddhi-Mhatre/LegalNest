import * as dynamo from '../../services/dynamoService';
import { env } from '../../config/env';
import { Auction } from '../entities/Auction';

const TABLE = env.DYNAMODB_AUCTIONS_TABLE;

export const getAuction = (auctionId: string) =>
  dynamo.getItem(TABLE, { auctionId }) as Promise<Auction | undefined>;

export const createAuction = (auction: Auction) => dynamo.putItem(TABLE, auction) as Promise<Auction>;

export const updateAuction = (auctionId: string, updates: Partial<Auction>) =>
  dynamo.updateItem(TABLE, { auctionId }, updates);

export const getAuctionsByStatus = (status: string) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'status-index',
    keyCondition: '#status = :status',
    expressionNames: { '#status': 'status' },
    expressionValues: { ':status': status },
  });

export const getActiveAuctions = () => getAuctionsByStatus('live');
