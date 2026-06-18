import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as s3Service from '../services/s3Service.js';
import { generateUUID } from '../utils/helpers.js';
import { HTTP } from '../utils/constants.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws.js';
import { env } from '../config/env.js';

// GET /v1/properties
export const listProperties = async (req, res, next) => {
  try {
    const { type, minPrice, maxPrice, geohash, status = 'verified' } = req.query;
    const properties = await PropertyModel.queryProperties({
      type,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      geohash,
      verificationStatus: status,
    });
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
};

// GET /v1/properties/:id
export const getProperty = async (req, res, next) => {
  try {
    const property = await PropertyModel.getProperty(req.params.id);
    if (!property) {
      return res.status(HTTP.NOT_FOUND).json({
        success: false,
        error: { code: 'PROP_001', message: 'Property not found' },
      });
    }

    // Increment view count (fire-and-forget, don't block response)
    const currentViews = property.viewsCount ?? property.viewCount ?? 0;
    PropertyModel.updateProperty(req.params.id, {
      viewsCount: currentViews + 1,
      viewCount: currentViews + 1,
    }).catch(() => {/* non-critical */});

    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

// POST /v1/properties
export const createProperty = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const propertyId = generateUUID();
    const now = new Date().toISOString();
    const property = await PropertyModel.createProperty({
      propertyId,
      sellerId,
      ...req.body,
      verificationStatus: 'pending',
      status: 'pending',
      viewsCount: 0,
      viewCount: 0,
      favoriteCount: 0,
      inquiryCount: 0,
      platformFeePaid: false,
      amenities: req.body.amenities ?? [],
      images: req.body.images ?? [],
      interestedBuyers: [],
      createdAt: now,
      updatedAt: now,
    });
    res.status(HTTP.CREATED).json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

// PUT /v1/properties/:id
export const updateProperty = async (req, res, next) => {
  try {
    const property = await PropertyModel.updateProperty(req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
};

// DELETE /v1/properties/:id
export const deleteProperty = async (req, res, next) => {
  try {
    await PropertyModel.deleteProperty(req.params.id);
    res.json({ success: true, data: { message: 'Property deleted' } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/properties/:id/interest
export const expressInterest = async (req, res, next) => {
  try {
    const buyerId = req.user.userId;
    const { id: propertyId } = req.params;
    await PropertyModel.addInterest(propertyId, buyerId);
    res.json({ success: true, data: { message: 'Interest expressed. Pending admin approval.' } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/properties/:id/favorite
export const saveFavorite = async (req, res, next) => {
  try {
    const buyerId = req.user.userId;
    await PropertyModel.addFavorite(req.params.id, buyerId);
    res.json({ success: true, data: { message: 'Saved to favorites' } });
  } catch (err) {
    next(err);
  }
};

// POST /v1/properties/upload-url
export const getUploadUrl = async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    const key = `properties/${req.user.userId}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_UPLOADS_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(
      s3Client,
      command,
      { expiresIn: 300 }
    );

    const publicUrl =
      `https://${env.S3_UPLOADS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error('getUploadUrl error:', error);
    res.status(500).json({
      message: "Failed to generate upload URL",
      detail: error.message,
    });
  }
};