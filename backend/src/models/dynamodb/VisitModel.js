import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_VISITS_TABLE;

export const createVisit = (visit) => dynamo.putItem(TABLE, visit);

export const getVisit = (visitId) => dynamo.getItem(TABLE, { visitId });

export const updateVisit = (visitId, updates) =>
  dynamo.updateItem(TABLE, { visitId }, updates);

export const deleteVisit = (visitId) => dynamo.deleteItem(TABLE, { visitId });

export const getVisitsByBuyer = (buyerId) =>
  dynamo.queryItems({
    tableName: TABLE,
    indexName: 'buyerId-index',
    keyCondition: 'buyerId = :bid',
    expressionValues: { ':bid': buyerId },
  });
