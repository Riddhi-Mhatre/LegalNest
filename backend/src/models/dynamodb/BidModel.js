import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_BIDS_TABLE;

/**
 * Persist a bid.
 * The table schema has PK=auctionId (S), SK=timestamp (S).
 * We always coerce timestamp to ISO-8601 string to match the table schema.
 */
export const putBid = (bid) => {
  const timestamp =
    typeof bid.timestamp === 'string'
      ? new Date(bid.timestamp).getTime()
      : bid.timestamp ?? Date.now();

  return dynamo.putItem(TABLE, { ...bid, timestamp });
};

/**
 * Returns bids for an auction, sorted newest-first by timestamp.
 */
export const getBidHistory = async (auctionId) => {
  const bids = await dynamo.queryItems({
    tableName: TABLE,
    keyCondition: 'auctionId = :aid',
    expressionValues: { ':aid': auctionId },
  });
  // Sort descending (latest bid first)
  return bids.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
};

export const getHighestBidder = async (auctionId) => {
  const bids = await getBidHistory(auctionId);
  return bids.sort((a, b) => b.amount - a.amount)[0] ?? null;
};
