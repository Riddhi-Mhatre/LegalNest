import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_SAVED_PROPERTIES_TABLE;

export const saveProp = (item) => dynamo.putItem(TABLE, item);

export const getSaved = (buyerId) =>
  dynamo.queryItems({
    tableName: TABLE,
    keyCondition: 'buyerId = :bid',
    expressionValues: { ':bid': buyerId },
  });

export const deleteSaved = (buyerId, propertyId) =>
  dynamo.deleteItem(TABLE, { buyerId, propertyId });

export const checkExists = async (buyerId, propertyId) => {
  const item = await dynamo.getItem(TABLE, { buyerId, propertyId });
  return !!item;
};
