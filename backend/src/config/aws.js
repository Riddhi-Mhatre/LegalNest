import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { S3Client } from '@aws-sdk/client-s3';
import { SNSClient } from '@aws-sdk/client-sns';
import { LocationClient } from '@aws-sdk/client-location';
import { env } from './env.js';

const clientConfig = { region: env.AWS_REGION };

// DynamoDB
const dynamoRawClient = new DynamoDBClient(clientConfig);
export const dynamoClient = DynamoDBDocumentClient.from(dynamoRawClient, {
  marshallOptions: { removeUndefinedValues: true, convertEmptyValues: true },
  unmarshallOptions: { wrapNumbers: false },
});

// Cognito
export const cognitoClient = new CognitoIdentityProviderClient(clientConfig);

// S3 — requestChecksumCalculation: WHEN_REQUIRED prevents SDK v3 from
// auto-injecting x-amz-checksum-crc32 into presigned PUT URLs.
// Browsers cannot satisfy that signed header, causing CORS preflight failures.
export const s3Client = new S3Client({
  ...clientConfig,
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

// SNS
export const snsClient = new SNSClient(clientConfig);

// AWS Location
export const locationClient = new LocationClient(clientConfig);
