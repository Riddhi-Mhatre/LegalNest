import { dynamoClient } from '../src/config/aws.js';
import { env } from '../src/config/env.js';
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

async function run() {
  console.log('Fetching all auctions...');
  const auctionsRes = await dynamoClient.send(new ScanCommand({ TableName: env.DYNAMODB_AUCTIONS_TABLE }));
  const auctions = auctionsRes.Items || [];

  console.log(`Found ${auctions.length} auctions. Calculating bids...`);

  const bidsRes = await dynamoClient.send(new ScanCommand({ TableName: env.DYNAMODB_BIDS_TABLE }));
  const allBids = bidsRes.Items || [];

  for (const auction of auctions) {
    const bidsForAuction = allBids.filter(b => b.auctionId === auction.auctionId);
    const count = bidsForAuction.length;
    
    console.log(`Auction ${auction.auctionId} has ${count} bids.`);
    
    await dynamoClient.send(
      new UpdateCommand({
        TableName: env.DYNAMODB_AUCTIONS_TABLE,
        Key: { auctionId: auction.auctionId },
        UpdateExpression: 'SET totalBids = :count',
        ExpressionAttributeValues: { ':count': count },
      })
    );
  }

  console.log('Done!');
  process.exit(0);
}

run().catch(console.error);
