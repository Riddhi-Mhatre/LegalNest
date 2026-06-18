import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws.js';
import { env } from '../config/env.js';

const PRESIGN_EXPIRY = 300; // 5 minutes

export const getMediaUploadUrl = async (fileName, fileType) => {
  const key = `properties/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: env.S3_MEDIA_BUCKET,
    Key: key,
    ContentType: fileType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRY });
};

export const getDocumentUploadUrl = async (userId, fileName, fileType, docType) => {
  // Sanitize filename — replace spaces and special chars that break S3 key paths
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `documents/${userId}/${docType}/${Date.now()}-${safeFileName}`;
  const command = new PutObjectCommand({
    Bucket: env.S3_DOCUMENTS_BUCKET,
    Key: key,
    ContentType: fileType || 'application/octet-stream',
  });
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRY });
  // Return both the presigned URL and the key directly (avoid URL parsing issues)
  return { uploadUrl, s3Key: key };
};

export const getDocumentReadUrl = async (key) => {
  const command = new GetObjectCommand({ Bucket: env.S3_DOCUMENTS_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRY });
};
