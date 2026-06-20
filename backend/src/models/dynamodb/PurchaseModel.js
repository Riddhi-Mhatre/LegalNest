import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_PURCHASES_TABLE;

export const createPurchase = (purchase) => dynamo.putItem(TABLE, purchase);

export const getPurchase = (purchaseId) =>
  dynamo.getItem(TABLE, { purchaseId });

export const getPurchasesByBuyer = (buyerId) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'buyerId-index',
    keyCondition: 'buyerId = :bid',
    expressionValues: { ':bid': buyerId },
  });

export const updatePurchase = (purchaseId, updates) =>
  dynamo.updateItem(TABLE, { purchaseId }, updates);
