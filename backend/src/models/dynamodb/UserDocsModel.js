import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { env } from '../../config/env.js';

const client = new DynamoDBClient({ region: env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const TableName = env.DYNAMODB_USER_DOCS_TABLE;

export const saveDocument = async (userId, documentId, metadata) => {
  const item = {
    userId,
    documentId, // e.g. 'aadhar_proof', 'pan_proof'
    ...metadata,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName,
    Item: item,
  }));

  return item;
};

export const getDocumentsByUser = async (userId) => {
  const result = await docClient.send(new QueryCommand({
    TableName,
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: {
      ':uid': userId,
    },
  }));
  return result.Items || [];
};

export const deleteDocument = async (userId, documentId) => {
  await docClient.send(new DeleteCommand({
    TableName,
    Key: { userId, documentId },
  }));
};
