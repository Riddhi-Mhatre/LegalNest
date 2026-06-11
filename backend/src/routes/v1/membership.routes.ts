import { Router } from 'express';
import * as membershipController from '../../controllers/membershipController';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize'; 

const router = Router();

router.get('/plans', membershipController.getPlans);
router.post('/subscribe', authenticate, membershipController.createSubscription);
router.post('/webhook', membershipController.handleWebhook); // no auth – verified via signature

export default router;
