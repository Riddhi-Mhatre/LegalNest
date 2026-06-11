import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  // AWS Core
  AWS_REGION: z.string(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // Cognito
  COGNITO_USER_POOL_ID: z.string(),
  COGNITO_CLIENT_ID: z.string(),

  // JWT
  JWT_SECRET: z.string().min(32),

  // DynamoDB Tables
  DYNAMODB_USERS_TABLE: z.string().default('GharBid-Users'),
  DYNAMODB_PROPERTIES_TABLE: z.string().default('GharBid-Properties'),
  DYNAMODB_AUCTIONS_TABLE: z.string().default('GharBid-Auctions'),
  DYNAMODB_BIDS_TABLE: z.string().default('GharBid-Bids'),
  DYNAMODB_TRANSACTIONS_TABLE: z.string().default('GharBid-Transactions'),
  DYNAMODB_CHAT_ROOMS_TABLE: z.string().default('GharBid-ChatRooms'),
  DYNAMODB_MESSAGES_TABLE: z.string().default('GharBid-Messages'),
  DYNAMODB_NOTIFICATIONS_TABLE: z.string().default('GharBid-Notifications'),

  // S3
  S3_MEDIA_BUCKET: z.string().default('gharbid-media'),
  S3_DOCUMENTS_BUCKET: z.string().default('gharbid-documents'),

  // Location
  LOCATION_INDEX_NAME: z.string().default('GharBidPlaceIndex'),

  // SES
  SES_FROM_EMAIL: z.string().email().default('noreply@gharbid.com'),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env: Env = parsed.data;
