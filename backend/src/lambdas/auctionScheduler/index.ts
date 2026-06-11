import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { sendAuctionWinnerEmail } from '../../services/emailService';
import { createNotification } from '../../services/notificationService';
import * as BidModel from '../../models/dynamodb/BidModel';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));

const finalizeAuction = async (auction: any) => {
  const winner = await BidModel.getHighestBidder(auction.auctionId);
  if (!winner) {
    // No bids – mark as ended with no winner
    await dynamo.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_AUCTIONS_TABLE!,
      Key: { auctionId: auction.auctionId },
      UpdateExpression: 'SET #status = :s',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { ':s': 'ended_no_bids' },
    }));
    return;
  }

  // Update auction with winner
  await dynamo.send(new UpdateCommand({
    TableName: process.env.DYNAMODB_AUCTIONS_TABLE!,
    Key: { auctionId: auction.auctionId },
    UpdateExpression: 'SET #status = :s, winnerId = :w',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':s': 'ended', ':w': winner.userId },
  }));

  // Notify winner
  await createNotification(winner.userId, 'auction_won', '🏆 You won the auction!', `Congratulations! Admin will unlock the chat shortly.`);
  // Email winner (requires user lookup)
  console.log(`Auction ${auction.auctionId} finalized. Winner: ${winner.userId}`);
};

// Triggered by EventBridge
export const handler = async (event: any) => {
  const now = Date.now();
  const { Items: endedAuctions = [] } = await dynamo.send(new QueryCommand({
    TableName: process.env.DYNAMODB_AUCTIONS_TABLE!,
    IndexName: 'status-endTime-index',
    KeyConditionExpression: '#status = :status AND endTime <= :now',
    ExpressionAttributeNames: { '#status': 'status' },
    ExpressionAttributeValues: { ':status': 'live', ':now': now },
  }));

  for (const auction of endedAuctions) {
    await finalizeAuction(auction);
  }

  return { processed: endedAuctions.length };
};
