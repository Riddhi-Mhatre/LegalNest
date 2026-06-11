import 'dotenv/config';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });

const tables = [
  {
    TableName: 'GharBid-Users',
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'email-index',
      KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'GharBid-Properties',
    KeySchema: [{ AttributeName: 'propertyId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'propertyId', AttributeType: 'S' },
      { AttributeName: 'sellerId', AttributeType: 'S' },
      { AttributeName: 'verificationStatus', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'sellerId-index',
        KeySchema: [{ AttributeName: 'sellerId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'verificationStatus-index',
        KeySchema: [{ AttributeName: 'verificationStatus', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'GharBid-Auctions',
    KeySchema: [{ AttributeName: 'auctionId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'auctionId', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'status-index',
      KeySchema: [{ AttributeName: 'status', KeyType: 'HASH' }],
      Projection: { ProjectionType: 'ALL' },
    }],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
  {
    TableName: 'GharBid-Bids',
    KeySchema: [
      { AttributeName: 'auctionId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'auctionId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' },
    ],
    BillingMode: 'PAY_PER_REQUEST' as const,
  },
];

async function createTables() {
  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table as any));
      console.log(`✅ Created table: ${table.TableName}`);
    } catch (err: any) {
      if (err.name === 'ResourceInUseException') {
        console.log(`⏩ Table already exists: ${table.TableName}`);
      } else {
        console.error(`❌ Error creating ${table.TableName}:`, err.message);
      }
    }
  }
}

createTables();
