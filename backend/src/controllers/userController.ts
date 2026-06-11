import { Request, Response, NextFunction } from 'express';
import * as UserModel from '../models/dynamodb/UserModel';
import * as s3Service from '../services/s3Service';
import { HTTP } from '../utils/constants';

// GET /v1/users/profile
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const user = await UserModel.getUser(userId);
    if (!user) return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'USER_001', message: 'User not found' } });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/users/profile
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const updated = await UserModel.updateUser(userId, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /v1/users/documents/upload-url
export const getDocumentUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { fileName, fileType, docType } = req.body;
    const url = await s3Service.getDocumentUploadUrl(userId, fileName, fileType, docType);
    res.json({ success: true, data: { uploadUrl: url } });
  } catch (err) {
    next(err);
  }
};

// GET /v1/users/notifications
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    // TODO: query NotificationsModel
    res.json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
};
