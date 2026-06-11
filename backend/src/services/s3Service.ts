import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws';
import { env } from '../config/env';

const PRESIGN_EXPIRY = 300; // 5 minutes

export const getMediaUploadUrl = async (fileName: string, fileType: string): Promise<string> => {
  const key = `properties/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: env.S3_MEDIA_BUCKET,
    Key: key,
    ContentType: fileType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRY });
};

export const getDocumentUploadUrl = async (
  userId: string,
  fileName: string,
  fileType: string,
  docType: string
): Promise<string> => {
  const key = `documents/${userId}/${docType}/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: env.S3_DOCUMENTS_BUCKET,
    Key: key,
    ContentType: fileType,
  });
  return getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRY });
};

export const getDocumentReadUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({ Bucket: env.S3_DOCUMENTS_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRY });
};
