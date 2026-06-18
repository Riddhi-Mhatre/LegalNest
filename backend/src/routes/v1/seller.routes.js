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
} from '../../controllers/sellerController.js';

const router = Router();

// All seller routes require authentication and seller role
router.use(authenticate, requireRole(['seller']));

router.get('/dashboard', getDashboard);
router.get('/properties', getMyProperties);
router.get('/document-upload-url', getDocumentUploadUrl);
router.patch('/properties/:id/documents', saveDocuments);
router.post('/properties/:id/pay-fee', payPlatformFee);
router.get('/payments', getMyPayments);

export default router;