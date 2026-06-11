import * as dynamo from '../../services/dynamoService';
import { env } from '../../config/env';
import { User } from '../entities/User';

const TABLE = env.DYNAMODB_USERS_TABLE;

export const getUser = (userId: string) =>
  dynamo.getItem(TABLE, { userId }) as Promise<User | undefined>;

export const getUserByEmail = async (email: string): Promise<User> => {
  const items = await dynamo.queryItems({
    tableName: TABLE,
    indexName: 'email-index',
    keyCondition: 'email = :email',
    expressionValues: { ':email': email },
  });
  if (!items[0]) throw new Error('User not found');
  return items[0] as User;
};

export const putUser = (user: User) => dynamo.putItem(TABLE, user);

export const updateUser = (userId: string, updates: Partial<User>) =>
  dynamo.updateItem(TABLE, { userId }, updates);

export const getAllUsers = () => dynamo.scanItems(TABLE);
