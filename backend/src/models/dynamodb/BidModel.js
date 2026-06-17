import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_BIDS_TABLE;

export const putBid = (bid) => dynamo.putItem(TABLE, { ...bid, timestamp: bid.timestamp });

export const getBidHistory = (auctionId) =>
  dynamo.queryItems({
    tableName: TABLE,
    keyCondition: 'auctionId = :aid',
    expressionValues: { ':aid': auctionId },
  });

export const getHighestBidder = async (auctionId) => {
  const bids = await getBidHistory(auctionId);
  return bids.sort((a, b) => b.amount - a.amount)[0];
};
