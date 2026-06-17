import * as PropertyModel from '../models/dynamodb/PropertyModel.js';
import * as PaymentModel from '../models/dynamodb/PaymentModel.js';
import * as s3Service from '../services/s3Service.js';
import { generateUUID } from '../utils/helpers.js';
import { HTTP } from '../utils/constants.js';

// GET /v1/seller/dashboard
export const getDashboard = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const properties = await PropertyModel.queryBySeller(sellerId);

    const totalProperties = properties.length;
    const pendingApproval = properties.filter(
      p => p.verificationStatus === 'pending' || p.status === 'pending'
    ).length;
    const approved = properties.filter(
      p => p.verificationStatus === 'verified' || p.status === 'approved'
    ).length;
    const rejected = properties.filter(
      p => p.verificationStatus === 'rejected' || p.status === 'rejected'
    ).length;
    const totalViews = properties.reduce(
      (sum, p) => sum + (p.viewsCount ?? p.viewCount ?? 0),
      0
    );

    res.json({
      success: true,
      data: {
        totalProperties,
        pendingApproval,
        approved,
        rejected,
        totalViews,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /v1/seller/properties
export const getMyProperties = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const properties = await PropertyModel.queryBySeller(sellerId);
    res.json({ success: true, data: properties });
  } catch (err) {
    next(err);
  }
};

// GET /v1/seller/document-upload-url
// Returns a pre-signed S3 URL for legal document upload
export const getDocumentUploadUrl = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { fileName, fileType, docType = 'other' } = req.query;

    if (!fileName || !fileType) {
      return res.status(HTTP.BAD_REQUEST).json({
        success: false,
        error: { code: 'UPLOAD_001', message: 'fileName and fileType are required' },
      });
    }

    const url = await s3Service.getDocumentUploadUrl(sellerId, fileName, fileType, docType);
    // S3 key is embedded in the URL path before the query string
    const s3Key = new URL(url).pathname.slice(1); // remove leading /

    res.json({ success: true, data: { uploadUrl: url, s3Key } });
  } catch (err) {
    next(err);
  }
};

// PATCH /v1/seller/properties/:id/documents
// Saves uploaded document S3 keys to the property record
export const saveDocuments = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { id: propertyId } = req.params;
    const { documents } = req.body;

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(HTTP.BAD_REQUEST).json({
        success: false,
        error: { code: 'DOC_001', message: 'documents array is required' },
      });
    }

    // Verify property belongs to this seller
    const property = await PropertyModel.getProperty(propertyId);
    if (!property) {
      return res.status(HTTP.NOT_FOUND).json({
        success: false,
        error: { code: 'PROP_001', message: 'Property not found' },
      });
    }
    if (property.sellerId !== sellerId) {
      return res.status(HTTP.FORBIDDEN).json({
        success: false,
        error: { code: 'AUTH_003', message: 'Access denied' },
      });
    }

    const updated = await PropertyModel.updateProperty(propertyId, {
      documents: [...(property.documents ?? []), ...documents],
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /v1/seller/properties/:id/pay-fee
// Records a platform fee payment for a property listing
export const payPlatformFee = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const { id: propertyId } = req.params;

    // Verify property exists and belongs to seller
    const property = await PropertyModel.getProperty(propertyId);
    if (!property) {
      return res.status(HTTP.NOT_FOUND).json({
        success: false,
        error: { code: 'PROP_001', message: 'Property not found' },
      });
    }
    if (property.sellerId !== sellerId) {
      return res.status(HTTP.FORBIDDEN).json({
        success: false,
        error: { code: 'AUTH_003', message: 'Access denied' },
      });
    }

    const amount = property.listingType === 'sale' ? 999 : 299;
    const paymentId = generateUUID();
    const now = new Date().toISOString();

    const payment = await PaymentModel.createPayment({
      paymentId,
      sellerId,
      propertyId,
      amount,
      type: property.listingType === 'sale' ? 'sale_listing' : 'rent_listing',
      status: 'success', // In production: integrate payment gateway
      createdAt: now,
    });

    // Mark property as fee paid
    await PropertyModel.updateProperty(propertyId, {
      platformFeePaid: true,
      updatedAt: now,
    });

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

// GET /v1/seller/payments
// Returns all platform fee payments for the seller
export const getMyPayments = async (req, res, next) => {
  try {
    const sellerId = req.user.userId;
    const payments = await PaymentModel.queryBySeller(sellerId);
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
};
