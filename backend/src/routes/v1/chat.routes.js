import { Router } from 'express';
import * as chatController from '../../controllers/chatController.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/rooms', authenticate, chatController.getRooms);
router.get('/rooms/:roomId/messages', authenticate, chatController.getMessages);
router.post('/rooms/:roomId/messages', authenticate, chatController.sendMessage);
router.put('/rooms/:roomId/read', authenticate, chatController.markRead);

// Deal flow routes
router.post('/rooms/:roomId/deal/request', authenticate, chatController.dealRequest);
router.post('/rooms/:roomId/deal/respond', authenticate, chatController.dealRespond);
router.post('/rooms/:roomId/meet/propose', authenticate, chatController.proposeMeet);
router.post('/rooms/:roomId/meet/confirm', authenticate, chatController.confirmMeet);
router.post('/rooms/:roomId/pay', authenticate, chatController.payDealFee);

export default router;
