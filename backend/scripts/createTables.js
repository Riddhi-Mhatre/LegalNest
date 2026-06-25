import 'dotenv/config';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });

const tables = [
  {
    TableName: 'LegalNest-Users',
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
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'LegalNest-Properties',
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
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'LegalNest-Auctions',
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
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'LegalNest-Bids',
    KeySchema: [
      { AttributeName: 'auctionId', KeyType: 'HASH' },
      { AttributeName: 'timestamp', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'auctionId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'N' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'LegalNest-Payments',
    KeySchema: [{ AttributeName: 'paymentId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'paymentId', AttributeType: 'S' },
      { AttributeName: 'propertyId', AttributeType: 'S' },
      { AttributeName: 'sellerId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'propertyId-index',
        KeySchema: [{ AttributeName: 'propertyId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'sellerId-index',
        KeySchema: [{ AttributeName: 'sellerId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function createTables() {
  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table));
      console.log(`✅ Created table: ${table.TableName}`);
    } catch (err) {
      if (err.name === 'ResourceInUseException') {
        console.log(`⏩ Table already exists: ${table.TableName}`);
      } else {
        console.error(`❌ Error creating ${table.TableName}:`, err.message);
      }
    }
  }
}

createTables();
