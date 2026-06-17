import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_PAYMENTS_TABLE;

export const createPayment = (payment) =>
  dynamo.putItem(TABLE, payment);

export const getPayment = (paymentId) =>
  dynamo.getItem(TABLE, { paymentId });

export const queryByProperty = (propertyId) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'propertyId-index',
    keyCondition: 'propertyId = :pid',
    expressionValues: { ':pid': propertyId },
  });

export const queryBySeller = (sellerId) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'sellerId-index',
    keyCondition: 'sellerId = :sid',
    expressionValues: { ':sid': sellerId },
  });
