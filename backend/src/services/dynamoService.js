import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoClient } from '../config/aws.js';

// Generic get item
export const getItem = async (tableName, key) => {
  const result = await dynamoClient.send(new GetCommand({ TableName: tableName, Key: key }));
  return result.Item;
};

// Generic put item
export const putItem = async (tableName, item) => {
  await dynamoClient.send(new PutCommand({ TableName: tableName, Item: item }));
  return item;
};

// Generic update item
export const updateItem = async (tableName, key, updates) => {
  const expressions = [];
  const names = {};
  const values = {};

  Object.entries(updates).forEach(([k, v], i) => {
    const alias = `#f${i}`;
    const val = `:v${i}`;
    expressions.push(`${alias} = ${val}`);
    names[alias] = k;
    values[val] = v;
  });

  // Only auto-add updatedAt if the caller didn't already include it
  if (!Object.prototype.hasOwnProperty.call(updates, 'updatedAt')) {
    values[':updatedAt'] = new Date().toISOString();
    expressions.push('#updatedAt = :updatedAt');
    names['#updatedAt'] = 'updatedAt';
  }

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
export const deleteItem = async (tableName, key) => {
  return dynamoClient.send(new DeleteCommand({ TableName: tableName, Key: key }));
};

// Generic query
export const queryItems = async (params) => {
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

// Raw query — accepts a full DynamoDB QueryCommand params object
export const query = async (params) => {
  const result = await dynamoClient.send(new QueryCommand(params));
  return result.Items ?? [];
};

// Generic scan (use sparingly)
export const scanItems = async (tableName, filterExpression, expressionValues) => {
  const result = await dynamoClient.send(
    new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionValues,
    })
  );
  return result.Items ?? [];
};
