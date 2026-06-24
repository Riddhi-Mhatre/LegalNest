import { Router } from 'express';
import * as propertyController from '../../controllers/propertyController.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { generalLimiter } from '../../middleware/rateLimit.js';
import {
  saveDocuments
} from "../../controllers/sellerController.js";

const router = Router();

// ─── Static/special routes MUST come before /:id ───────────────────────────
// upload-url must be before /:id or Express will match 'upload-url' as an id
router.post('/upload-url', authenticate, requireRole(['seller']), propertyController.getUploadUrl);

// ─── Public routes ──────────────────────────────────────────────────────────
router.get('/', generalLimiter, propertyController.listProperties);
router.get('/:id', generalLimiter, optionalAuthenticate, propertyController.getProperty);

// ─── Seller routes ──────────────────────────────────────────────────────────
router.post('/', authenticate, requireRole(['seller']), propertyController.createProperty);
router.put('/:id', authenticate, requireRole(['seller']), propertyController.updateProperty);
router.delete('/:id', authenticate, requireRole(['seller']), propertyController.deleteProperty);

// ─── Buyer routes ───────────────────────────────────────────────────────────
router.post('/:id/interest', authenticate, requireRole(['buyer']), propertyController.expressInterest);
router.post('/:id/favorite', authenticate, requireRole(['buyer']), propertyController.saveFavorite);

export default router;
