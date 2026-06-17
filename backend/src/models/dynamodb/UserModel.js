import * as dynamo from '../../services/dynamoService.js';
import { env } from '../../config/env.js';

const TABLE = env.DYNAMODB_USERS_TABLE;

export const getUser = (userId) =>
  dynamo.getItem(TABLE, { userId });

export const getUserByEmail = async (email) => {
  const items = await dynamo.queryItems({
    tableName: TABLE,
    indexName: 'email-index',
    keyCondition: 'email = :email',
    expressionValues: { ':email': email },
  });
  if (!items[0]) throw new Error('User not found');
  return items[0];
};

export const putUser = (user) => dynamo.putItem(TABLE, user);

export const updateUser = (userId, updates) =>
  dynamo.updateItem(TABLE, { userId }, updates);

export const getAllUsers = () => dynamo.scanItems(TABLE);
