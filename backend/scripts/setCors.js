/**
 * Sets CORS on both S3 buckets so browser presigned PUT requests work.
 * Run once: node scripts/setCors.js
 */
import 'dotenv/config';
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const CORS_RULES = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['PUT', 'GET', 'HEAD'],
      AllowedOrigins: [
        'http://localhost:5173',
        process.env.FRONTEND_URL ?? 'http://localhost:5173',
      ],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3000,
    },
  ],
};

const BUCKETS = [
  process.env.S3_UPLOADS_BUCKET ?? 'gharbid-property-images',
  process.env.S3_DOCUMENTS_BUCKET ?? 'gharbid-documents',
  process.env.S3_MEDIA_BUCKET ?? 'gharbid-app-storage-2026',
];

(async () => {
  for (const Bucket of BUCKETS) {
    try {
      await s3.send(new PutBucketCorsCommand({ Bucket, CORSConfiguration: CORS_RULES }));
      console.log(`✅  CORS set on: ${Bucket}`);
    } catch (err) {
      console.error(`❌  Failed for ${Bucket}:`, err.message);
    }
  }
})();
