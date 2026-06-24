import * as UserModel from '../models/dynamodb/UserModel.js';
import * as s3Service from '../services/s3Service.js';
import { HTTP } from '../utils/constants.js';

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

// GET /v1/users/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    // TODO: query NotificationsModel
    res.json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
};
