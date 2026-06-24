import { CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Raw DynamoDB client (not the Document client) is needed for CreateTable
const rawClient = new DynamoDBClient({ region: env.AWS_REGION });

const PAY_PER_REQUEST = { BillingMode: 'PAY_PER_REQUEST' };

/**
 * Build a GSI definition (all attributes projected).
 * sk is optional — omit for hash-only GSIs.
 */
const gsi = (name, pk, pkType = 'S', sk, skType = 'S') => {
  const keySchema = [{ AttributeName: pk, KeyType: 'HASH' }];
  const attrDefs = [{ AttributeName: pk, AttributeType: pkType }];
  if (sk) {
    keySchema.push({ AttributeName: sk, KeyType: 'RANGE' });
    attrDefs.push({ AttributeName: sk, AttributeType: skType });
  }
  return {
    gsi: {
      IndexName: name,
      KeySchema: keySchema,
      Projection: { ProjectionType: 'ALL' },
    },
    attrDefs,
  };
};

/**
 * Full table definitions derived from all DynamoDB model files.
 *
 * Keys:
 *   tableName  — resolved from env (respects overrides via .env)
 *   pk / pkType — partition key name / type ('S' | 'N')
 *   sk / skType — sort key (optional)
 *   gsis        — array of GSI configs built with the gsi() helper
 */
const TABLE_DEFINITIONS = [
  // ── Users ────────────────────────────────────────────────────────────────
  {
    tableName: env.DYNAMODB_USERS_TABLE,
    pk: 'userId', pkType: 'S',
    gsis: [gsi('email-index', 'email')],
  },

  // ── Properties ───────────────────────────────────────────────────────────
  {
    tableName: env.DYNAMODB_PROPERTIES_TABLE,
    pk: 'propertyId', pkType: 'S',
    gsis: [
      gsi('sellerId-index',           'sellerId'),
      gsi('verificationStatus-index', 'verificationStatus'),
      gsi('geohash-index',            'geohash'),
    ],
  },

  // ── Auctions ─────────────────────────────────────────────────────────────
  {
    tableName: env.DYNAMODB_AUCTIONS_TABLE,
    pk: 'auctionId', pkType: 'S',
    gsis: [gsi('status-index', 'status')],
  },

  // ── Bids (PK: auctionId, SK: timestamp) ─────────────────────────────────
  {
    tableName: env.DYNAMODB_BIDS_TABLE,
    pk: 'auctionId', pkType: 'S',
    sk: 'timestamp',  skType: 'S',
    gsis: [],
  },

  // ── Transactions ─────────────────────────────────────────────────────────
  {
    tableName: env.DYNAMODB_TRANSACTIONS_TABLE,
    pk: 'transactionId', pkType: 'S',
    gsis: [],
  },

  // ── Payments ─────────────────────────────────────────────────────────────
  {
    tableName: env.DYNAMODB_PAYMENTS_TABLE,
    pk: 'paymentId', pkType: 'S',
    gsis: [
      gsi('propertyId-index', 'propertyId'),
      gsi('sellerId-index',   'sellerId'),
    ],
  },

  // ── Saved Properties (PK: buyerId, SK: propertyId) ───────────────────────
  {
    tableName: env.DYNAMODB_SAVED_PROPERTIES_TABLE,
    pk: 'buyerId',    pkType: 'S',
    sk: 'propertyId', skType: 'S',
    gsis: [],
  },

  // ── Visits ───────────────────────────────────────────────────────────────
  {
    tableName: env.DYNAMODB_VISITS_TABLE,
    pk: 'visitId', pkType: 'S',
    gsis: [gsi('buyerId-index', 'buyerId')],
  },

  // ── Purchases ────────────────────────────────────────────────────────────
  {
    tableName: env.DYNAMODB_PURCHASES_TABLE,
    pk: 'purchaseId', pkType: 'S',
    gsis: [gsi('buyerId-index', 'buyerId')],
  },

  // ── Memberships ──────────────────────────────────────────────────────────
  {
    tableName: env.DYNAMODB_MEMBERSHIPS_TABLE,
    pk: 'userId', pkType: 'S',
    gsis: [],
  },

  // ── Chat Rooms ───────────────────────────────────────────────────────────
  // Queried by buyerId via 'userId-index' in chatService (keyCondition uses buyerId OR sellerId,
  // but DynamoDB doesn't support OR on GSI — index covers buyerId as PK).
  {
    tableName: env.DYNAMODB_CHAT_ROOMS_TABLE,
    pk: 'roomId', pkType: 'S',
    gsis: [
      gsi('buyerId-index',  'buyerId'),
      gsi('sellerId-index', 'sellerId'),
    ],
  },

  // ── Messages (PK: roomId, SK: messageId) ─────────────────────────────────
  {
    tableName: env.DYNAMODB_MESSAGES_TABLE,
    pk: 'roomId',    pkType: 'S',
    sk: 'messageId', skType: 'S',
    gsis: [],
  },

  // ── Notifications (PK: userId, SK: notificationId) ───────────────────────
  {
    tableName: env.DYNAMODB_NOTIFICATIONS_TABLE,
    pk: 'userId',         pkType: 'S',
    sk: 'notificationId', skType: 'S',
    gsis: [],
  },
];

/**
 * Check whether a table already exists in DynamoDB.
 */
const tableExists = async (tableName) => {
  try {
    await rawClient.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false;
    throw err;
  }
};

/**
 * Create a single table from its definition object.
 * Collects all attribute definitions (table keys + GSI keys), deduplicates them,
 * and issues a single CreateTableCommand.
 */
const createTable = async ({ tableName, pk, pkType, sk, skType, gsis }) => {
  // Collect attribute definitions — deduplicate by name
  const attrMap = new Map();
  attrMap.set(pk, pkType);
  if (sk) attrMap.set(sk, skType);

  const globalSecondaryIndexes = [];
  for (const g of gsis) {
    globalSecondaryIndexes.push(g.gsi);
    for (const a of g.attrDefs) {
      if (!attrMap.has(a.AttributeName)) {
        attrMap.set(a.AttributeName, a.AttributeType);
      }
    }
  }

  const keySchema = [{ AttributeName: pk, KeyType: 'HASH' }];
  if (sk) keySchema.push({ AttributeName: sk, KeyType: 'RANGE' });

  const params = {
    TableName: tableName,
    KeySchema: keySchema,
    AttributeDefinitions: Array.from(attrMap.entries()).map(([name, type]) => ({
      AttributeName: name,
      AttributeType: type,
    })),
    ...PAY_PER_REQUEST,
    ...(globalSecondaryIndexes.length > 0 && { GlobalSecondaryIndexes: globalSecondaryIndexes }),
  };

  await rawClient.send(new CreateTableCommand(params));
};

/**
 * Provision all application tables on startup.
 * Skips tables that already exist — safe to call on every boot.
 */
export const provisionTables = async () => {
  logger.info('🗄️  Checking DynamoDB tables...');

  const results = await Promise.allSettled(
    TABLE_DEFINITIONS.map(async (def) => {
      const exists = await tableExists(def.tableName);
      if (exists) {
        logger.info(`  ✅ ${def.tableName} — already exists`);
        return;
      }
      await createTable(def);
      logger.info(`  🆕 ${def.tableName} — created`);
    })
  );

  const errors = results.filter((r) => r.status === 'rejected');
  if (errors.length > 0) {
    for (const e of errors) {
      logger.error(`  ❌ Table provisioning error: ${e.reason?.message || e.reason}`);
    }
    throw new Error(`Failed to provision ${errors.length} DynamoDB table(s). See logs above.`);
  }

  logger.info('🗄️  All DynamoDB tables are ready.');
};
