import { Router } from 'express';
import * as adminController from '../../controllers/adminController';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

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
