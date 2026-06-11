import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '../config/aws';

// Generic get item
export const getItem = async (tableName: string, key: Record<string, any>) => {
  const result = await dynamoClient.send(new GetCommand({ TableName: tableName, Key: key }));
  return result.Item;
};

// Generic put item
export const putItem = async (tableName: string, item: Record<string, any>) => {
  await dynamoClient.send(new PutCommand({ TableName: tableName, Item: item }));
  return item;
};

// Generic update item
export const updateItem = async (
  tableName: string,
  key: Record<string, any>,
  updates: Record<string, any>
) => {
  const expressions: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};

  Object.entries(updates).forEach(([k, v], i) => {
    const alias = `#f${i}`;
    const val = `:v${i}`;
    expressions.push(`${alias} = ${val}`);
    names[alias] = k;
    values[val] = v;
  });

  values[':updatedAt'] = new Date().toISOString();
  expressions.push('#updatedAt = :updatedAt');
  names['#updatedAt'] = 'updatedAt';

  const result = await dynamoClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: 'ALL_NEW',
    })
  );
  return result.Attributes;
};

// Generic delete item
export const deleteItem = async (tableName: string, key: Record<string, any>) => {
  return dynamoClient.send(new DeleteCommand({ TableName: tableName, Key: key }));
};

// Generic query
export const queryItems = async (params: {
  tableName: string;
  indexName?: string;
  keyCondition: string;
  filterExpression?: string;
  expressionNames?: Record<string, string>;
  expressionValues: Record<string, any>;
  limit?: number;
}) => {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: params.tableName,
      IndexName: params.indexName,
      KeyConditionExpression: params.keyCondition,
      FilterExpression: params.filterExpression,
      ExpressionAttributeNames: params.expressionNames,
      ExpressionAttributeValues: params.expressionValues,
      Limit: params.limit,
    })
  );
  return result.Items ?? [];
};

// Generic scan (use sparingly)
export const scanItems = async (tableName: string, filterExpression?: string, expressionValues?: Record<string, any>) => {
  const result = await dynamoClient.send(
    new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionValues,
    })
  );
  return result.Items ?? [];
};
