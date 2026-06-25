import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import * as inquiryController from '../../controllers/inquiryController.js';

const router = Router();

// ─── Seller inquiry routes ────────────────────────────────────────────────────
router.get('/seller', authenticate, requireRole(['seller']), inquiryController.getSellerInquiries);
router.post('/:inquiryId/accept', authenticate, requireRole(['seller']), inquiryController.acceptInquiry);
router.post('/:inquiryId/reject', authenticate, requireRole(['seller']), inquiryController.rejectInquiry);

// ─── Buyer inquiry routes ─────────────────────────────────────────────────────
router.get('/buyer', authenticate, requireRole(['buyer']), inquiryController.getBuyerInquiries);

export default router;
