import { Router } from 'express';
import * as adminController from '../../controllers/adminController.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';

const router = Router();

// All admin routes require admin role
router.use(authenticate, requireRole(['admin']));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.listUsers);
router.put('/users/:userId/verify', adminController.verifyUser);
router.get('/properties/pending', adminController.getPendingProperties);
router.put('/properties/:id/approve', adminController.approveProperty);
router.put('/properties/:id/reject', adminController.rejectProperty);
router.post('/auctions', adminController.scheduleAuction);
router.put('/interests/:interestId/approve', adminController.approveInterest);

export default router;
