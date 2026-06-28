import * as UserModel from '../models/dynamodb/UserModel.js';
import * as UserDocsModel from '../models/dynamodb/UserDocsModel.js';
import * as s3Service from '../services/s3Service.js';
import * as buyerNotificationService from '../services/buyerNotificationService.js';
import { HTTP } from '../utils/constants.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws.js';
import { env } from '../config/env.js';

// GET /v1/users/profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await UserModel.getUser(userId);
    if (!user) return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'USER_001', message: 'User not found' } });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    if (req.body.kycDocuments) {
      for (const [docKey, s3Key] of Object.entries(req.body.kycDocuments)) {
        await UserDocsModel.saveDocument(userId, docKey, { s3Key });
      }
      req.body.isVerified = true;
    }
    
    const updated = await UserModel.updateUser(userId, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /v1/users/documents/upload-url
export const getDocumentUploadUrl = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { fileName, fileType, docType } = req.body;
    const url = await s3Service.getDocumentUploadUrl(userId, fileName, fileType, docType);
    res.json({ success: true, data: { uploadUrl: url.uploadUrl, s3Key: url.s3Key } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/users/upload-avatar-url
export const getAvatarUploadUrl = async (req, res, next) => {
  try {
    const { fileName, contentType } = req.body;
    const key = `avatars/${req.user.userId}/${Date.now()}-${fileName}`;
    const command = new PutObjectCommand({
      Bucket: env.S3_UPLOADS_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const publicUrl = `https://${env.S3_UPLOADS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ success: true, data: { uploadUrl, publicUrl, key } });
  } catch (err) {
    next(err);
  }
};

// GET /v1/users/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notifications = await buyerNotificationService.getNotifications(userId);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/users/notifications/:notificationId/read
export const markNotificationRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;
    await buyerNotificationService.markNotificationRead(userId, notificationId);
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (err) {
    next(err);
  }
};

// DELETE /v1/users/notifications/:notificationId
export const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;
    await buyerNotificationService.deleteNotification(userId, notificationId);
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
};
