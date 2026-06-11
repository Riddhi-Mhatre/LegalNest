import * as dynamo from '../../services/dynamoService';
import { env } from '../../config/env';
import { Bid } from '../entities/Bid';

const TABLE = env.DYNAMODB_BIDS_TABLE;

export const putBid = (bid: Bid) => dynamo.putItem(TABLE, { ...bid, timestamp: bid.timestamp });

export const getBidHistory = (auctionId: string) =>
  dynamo.queryItems({
    tableName: TABLE,
    keyCondition: 'auctionId = :aid',
    expressionValues: { ':aid': auctionId },
  });

export const getHighestBidder = async (auctionId: string): Promise<Bid | undefined> => {
  const bids = await getBidHistory(auctionId);
  return (bids as Bid[]).sort((a, b) => b.amount - a.amount)[0];
};
