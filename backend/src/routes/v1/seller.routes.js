import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

import {
  getDashboard,
  getMyProperties,
  getDocumentUploadUrl,
  saveDocuments,
  payPlatformFee,
  getMyPayments,
  markSold,
} from '../../controllers/sellerController.js';
import * as sellerAuctionController from '../../controllers/sellerAuctionController.js';

const router = Router();

// All seller routes require authentication and seller role
router.use(authenticate, requireRole(['seller']));

router.get('/dashboard', getDashboard);
router.get('/properties', getMyProperties);
router.get('/document-upload-url', getDocumentUploadUrl);
router.patch('/properties/:id/documents', saveDocuments);
router.post('/properties/:id/pay-fee', payPlatformFee);
router.get('/payments', getMyPayments);
router.post('/properties/:id/sold', markSold);

// Auction management
router.get('/auctions', sellerAuctionController.getAllSellerAuctions);
router.post('/properties/:id/auction', sellerAuctionController.scheduleAuction);
router.get('/properties/:id/auction', sellerAuctionController.getAuctionDetails);
router.get('/properties/:id/auction/bids', sellerAuctionController.getAuctionHistory);
router.get('/properties/:id/interested-buyers', sellerAuctionController.getInterestedBuyers);

export default router;