import { Router } from 'express';
import * as userController from '../../controllers/userController.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.post('/documents/upload-url', authenticate, userController.getDocumentUploadUrl);
router.get('/notifications', authenticate, userController.getNotifications);
router.put('/notifications/:notificationId/read', authenticate, userController.markNotificationRead);
router.delete('/notifications/:notificationId', authenticate, userController.deleteNotification);

export default router;
