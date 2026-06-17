import { createNotification } from '../../services/notificationService.js';

// Triggered by S3 PUT on gharbid-documents bucket
export const handler = async (event) => {
  for (const record of event.Records) {
    const key = record.s3.object.key;
    // key pattern: documents/{userId}/{docType}/{filename}
    const parts = key.split('/');
    const userId = parts[1];
    const docType = parts[2];

    console.log(`Document uploaded: ${docType} for user ${userId}`);

    // Notify admin (for now, create a notification for all admins)
    // In production, query admin users and notify each
    await createNotification(
      'admin',
      'document_upload',
      'New Document Uploaded',
      `User ${userId} uploaded ${docType} for verification.`,
      { userId, docType, s3Key: key }
    );
  }
};
