import { Router } from 'express';
import * as chatController from '../../controllers/chatController';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/authorize'; 

const router = Router();

router.get('/rooms', authenticate, chatController.getRooms);
router.get('/rooms/:roomId/messages', authenticate, chatController.getMessages);
router.post('/rooms/:roomId/messages', authenticate, chatController.sendMessage);
router.put('/rooms/:roomId/read', authenticate, chatController.markRead);

export default router;
