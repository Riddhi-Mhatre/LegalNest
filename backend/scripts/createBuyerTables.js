#!/usr/bin/env node
/**
 * Create new DynamoDB tables required for Buyer Dashboard.
 * Run: node scripts/createBuyerTables.js
 *
 * Skips creation if table already exists.
 */
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

const tableExists = async (TableName) => {
  try {
    await client.send(new DescribeTableCommand({ TableName }));
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false;
    throw err;
  }
};

const createIfMissing = async (params) => {
  const { TableName } = params;
  if (await tableExists(TableName)) {
    console.log(`  ✓ Table already exists: ${TableName}`);
    return;
  }
  await client.send(new CreateTableCommand(params));
  console.log(`  ✅ Created: ${TableName}`);
};

const tables = [
  // BuyerSavedProperties – composite key: buyerId + propertyId
  {
    TableName: process.env.DYNAMODB_SAVED_PROPERTIES_TABLE || 'LegalNest-SavedProperties',
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [
      { AttributeName: 'buyerId', KeyType: 'HASH' },
      { AttributeName: 'propertyId', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'buyerId', AttributeType: 'S' },
      { AttributeName: 'propertyId', AttributeType: 'S' },
    ],
  },

  // PropertyVisits – PK: visitId; GSI: buyerId
  {
    TableName: process.env.DYNAMODB_VISITS_TABLE || 'LegalNest-Visits',
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [{ AttributeName: 'visitId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'visitId', AttributeType: 'S' },
      { AttributeName: 'buyerId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'buyerId-index',
        KeySchema: [{ AttributeName: 'buyerId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },

  // PurchasedProperties – PK: purchaseId; GSI: buyerId
  {
    TableName: process.env.DYNAMODB_PURCHASES_TABLE || 'LegalNest-Purchases',
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [{ AttributeName: 'purchaseId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'purchaseId', AttributeType: 'S' },
      { AttributeName: 'buyerId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'buyerId-index',
        KeySchema: [{ AttributeName: 'buyerId', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  },

  // Memberships – PK: userId (one record per user)
  {
    TableName: process.env.DYNAMODB_MEMBERSHIPS_TABLE || 'LegalNest-Memberships',
    BillingMode: 'PAY_PER_REQUEST',
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
  },
];

(async () => {
  console.log('\n🚀 Creating Buyer Dashboard DynamoDB tables...\n');
  for (const t of tables) {
    try {
      await createIfMissing(t);
    } catch (err) {
      console.error(`  ❌ Error creating ${t.TableName}:`, err.message);
    }
  }
  console.log('\nDone.\n');
})();
