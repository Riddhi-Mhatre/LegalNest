import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as InquiryModel from '../models/dynamodb/InquiryModel.js';
import * as s3Service from '../services/s3Service.js';
import { generateUUID } from '../utils/helpers.js';
import { HTTP } from '../utils/constants.js';
import { createNotification } from '../services/notificationService.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/aws.js';
import { env } from '../config/env.js';

// GET /v1/properties
export const listProperties = async (req, res, next) => {
  try {
    const { type, minPrice, maxPrice, geohash, status = 'approved' } = req.query;
    const properties = await PropertyModel.queryProperties({
      type,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      geohash,
      status,
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
    
    // Only increment if the viewer is not the seller of this property
    if (!req.user || req.user.userId !== property.sellerId) {
      const viewers = property.viewers || [];
      if (req.user && req.user.userId) {
        // Prevent duplicate recent views from same user
        const alreadyViewedRecently = viewers.some((v) => v.viewerId === req.user.userId);
        if (!alreadyViewedRecently) {
          viewers.push({
            viewerId: req.user.userId,
            viewerName: req.user.name || 'User',
            propertyId: property.propertyId,
            propertyTitle: property.title,
            timestamp: new Date().toISOString(),
          });
        }
      }

      PropertyModel.updateProperty(req.params.id, {
        viewsCount: currentViews + 1,
        viewCount: currentViews + 1,
        viewers,
      }).catch(() => {/* non-critical */});
    }

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
      verificationStatus: 'verified',
      status: 'approved',
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

    await createNotification(sellerId, 'property_listed', 'New Property Listed', `Your property has been successfully listed.`, { propertyId });

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
      const buyerName = req.user.name || 'Buyer';
      const { id: propertyId } = req.params;
      const isAuction = req.query.source === 'auction';
  
      const property = await PropertyModel.getProperty(propertyId);
      if (!property) {
        return res.status(HTTP.NOT_FOUND).json({
          success: false,
          error: { code: 'PROP_001', message: 'Property not found' },
        });
      }
  
      // Prevent buyer from expressing interest in own property
      if (property.sellerId === buyerId) {
        return res.status(HTTP.FORBIDDEN).json({
          success: false,
          error: { message: 'Cannot express interest in your own property' },
        });
      }
  
      // If this is just for an auction interest list, skip creating a formal Inquiry/chat request
      if (isAuction) {
        await PropertyModel.addInterest(propertyId, buyerId);
        
        // Notify the seller
        import('../websocket/server.js').then(({ io }) => {
          if (io) {
            io.to(`user_${property.sellerId}`).emit('notification', {
              type: 'auction_interest',
              message: `${buyerName} is interested in your scheduled auction for ${property.title}`
            });
          }
        }).catch(console.error);

        await createNotification(property.sellerId, 'buyer_interest', 'New Buyer Interest', `${buyerName} is interested in your scheduled auction for ${property.title}`, { propertyId });

        return res.status(HTTP.CREATED).json({ success: true, data: { message: 'Interest registered for auction' } });
      }

      // Check for existing pending inquiry (for standard property inquiries)
      const existing = await InquiryModel.getPendingInquiriesForProperty(propertyId, buyerId);
    if (existing.length > 0) {
      return res.status(HTTP.CONFLICT).json({
        success: false,
        error: { code: 'INQ_001', message: 'You already have a pending inquiry for this property' },
      });
    }

    const inquiry = {
      inquiryId: generateUUID(),
      buyerId,
      buyerName,
      sellerId: property.sellerId,
      propertyId,
      propertyTitle: property.title,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await InquiryModel.createInquiry(inquiry);

    // Also track in the property's interestedBuyers for backward compat
    await PropertyModel.addInterest(propertyId, buyerId);

    // Notify the seller
    import('../websocket/server.js').then(({ io }) => {
      if (io) {
        io.to(`user_${property.sellerId}`).emit('inquiry_alert', {
          inquiryId: inquiry.inquiryId,
          message: 'You have a new property inquiry'
        });
      }
    }).catch(console.error);

    await createNotification(property.sellerId, 'buyer_interest', 'New Buyer Interest', `You have a new property inquiry from ${buyerName}`, { propertyId, inquiryId: inquiry.inquiryId });

    res.status(HTTP.CREATED).json({ success: true, data: inquiry });
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