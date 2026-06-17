import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import * as sellerController from '../../controllers/sellerController.js';

const router = Router();

// All seller routes require authentication and the 'seller' role
router.use(authenticate, requireRole(['seller']));

router.get('/dashboard', sellerController.getDashboard);
router.get('/properties', sellerController.getMyProperties);
router.get('/document-upload-url', sellerController.getDocumentUploadUrl);
router.patch('/properties/:id/documents', sellerController.saveDocuments);
router.post('/properties/:id/pay-fee', sellerController.payPlatformFee);
router.get('/payments', sellerController.getMyPayments);

export default router;
