import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { LocationClient } from '@aws-sdk/client-location';
import { env } from './env';

const clientConfig = { region: env.AWS_REGION };

// DynamoDB
const dynamoRawClient = new DynamoDBClient(clientConfig);
export const dynamoClient = DynamoDBDocumentClient.from(dynamoRawClient, {
  marshallOptions: { removeUndefinedValues: true, convertEmptyValues: false },
  unmarshallOptions: { wrapNumbers: false },
});

// Cognito
export const cognitoClient = new CognitoIdentityProviderClient(clientConfig);

// S3
export const s3Client = new S3Client(clientConfig);

// SES
export const sesClient = new SESClient(clientConfig);

// AWS Location
export const locationClient = new LocationClient(clientConfig);
