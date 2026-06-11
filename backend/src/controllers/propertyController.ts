import { Request, Response, NextFunction } from 'express';
import * as PropertyModel from '../models/dynamodb/PropertyModel';
import * as s3Service from '../services/s3Service';
import { generateUUID } from '../utils/helpers';
import { HTTP } from '../utils/constants';

// GET /v1/properties
export const listProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, minPrice, maxPrice, geohash, status = 'verified' } = req.query;
    const properties = await PropertyModel.queryProperties({
      type: type as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      geohash: geohash as string,
      verificationStatus: status as string,
    });
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
};

// GET /v1/properties/:id
export const getProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await PropertyModel.getProperty(req.params.id);
    if (!property) return res.status(HTTP.NOT_FOUND).json({ success: false, error: { code: 'PROP_001', message: 'Property not found' } });
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

// POST /v1/properties
export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = (req as any).user.userId;
    const propertyId = generateUUID();
    const property = await PropertyModel.createProperty({
      propertyId,
      sellerId,
      ...req.body,
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
    });
    res.status(HTTP.CREATED).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/properties/:id
export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await PropertyModel.updateProperty(req.params.id, req.body);
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

// DELETE /v1/properties/:id
export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await PropertyModel.deleteProperty(req.params.id);
    res.json({ success: true, data: { message: 'Property deleted' } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/properties/:id/interest
export const expressInterest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = (req as any).user.userId;
    const { id: propertyId } = req.params;
    await PropertyModel.addInterest(propertyId, buyerId);
    res.json({ success: true, data: { message: 'Interest expressed. Pending admin approval.' } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/properties/:id/favorite
export const saveFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buyerId = (req as any).user.userId;
    await PropertyModel.addFavorite(req.params.id, buyerId);
    res.json({ success: true, data: { message: 'Saved to favorites' } });
  } catch (err) {
    next(err);
  }
};

// GET /v1/properties/:id/upload-url
export const getUploadUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName, fileType } = req.query;
    const url = await s3Service.getMediaUploadUrl(fileName as string, fileType as string);
    res.json({ success: true, data: { uploadUrl: url } });
  } catch (err) {
    next(err);
  }
};
