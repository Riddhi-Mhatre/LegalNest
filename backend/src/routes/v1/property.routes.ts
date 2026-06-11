import { Router } from 'express';
import * as propertyController from '../../controllers/propertyController';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { generalLimiter } from '../../middleware/rateLimit';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.get('/', generalLimiter, propertyController.listProperties);
router.get('/:id', generalLimiter, propertyController.getProperty);
router.post('/', authenticate, requireRole(['seller']), propertyController.createProperty);
router.put('/:id', authenticate, requireRole(['seller', 'admin']), propertyController.updateProperty);
router.delete('/:id', authenticate, requireRole(['seller', 'admin']), propertyController.deleteProperty);
router.post('/:id/interest', authenticate, requireRole(['buyer']), propertyController.expressInterest);
router.post('/:id/favorite', authenticate, requireRole(['buyer']), propertyController.saveFavorite);
router.get('/:id/upload-url', authenticate, requireRole(['seller']), propertyController.getUploadUrl);
router.use(
  authenticate,
  requireRole(['seller'])
);
export default router;
