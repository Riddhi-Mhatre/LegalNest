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
                          DYNAMODB_USERS_TABLE: z.string().default('LegalNest-Users'),
                            DYNAMODB_PROPERTIES_TABLE: z.string().default('LegalNest-Properties'),
                              DYNAMODB_AUCTIONS_TABLE: z.string().default('LegalNest-Auctions'),
                                DYNAMODB_BIDS_TABLE: z.string().default('LegalNest-Bids'),
                                  DYNAMODB_TRANSACTIONS_TABLE: z.string().default('LegalNest-Transactions'),
                                    DYNAMODB_CHAT_ROOMS_TABLE: z.string().default('LegalNest-ChatRooms'),
                                      DYNAMODB_MESSAGES_TABLE: z.string().default('LegalNest-Messages'),
                                        DYNAMODB_NOTIFICATIONS_TABLE: z.string().default('LegalNest-Notifications'),

                                          // S3
                                            S3_MEDIA_BUCKET: z.string().default('legalnest-media'),
                                              S3_DOCUMENTS_BUCKET: z.string().default('legalnest-documents'),

                                                // Location
                                                  LOCATION_INDEX_NAME: z.string().default('LegalNestPlaceIndex'),

                                                    // SES
                                                      SES_FROM_EMAIL: z.string().email().default('noreply@legalnest.com'),

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
                                                              