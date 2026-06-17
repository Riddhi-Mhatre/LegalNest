import { Router } from 'express';
import * as auctionController from '../../controllers/auctionController.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { generalLimiter, bidLimiter } from '../../middleware/rateLimit.js';

const router = Router();

router.get('/', generalLimiter, auctionController.listAuctions);
router.get('/:id', generalLimiter, auctionController.getAuction);
router.get('/:id/bids', generalLimiter, auctionController.getBidHistory);
router.post('/:id/bid', authenticate, requireRole(['buyer']), bidLimiter, auctionController.placeBid);
router.post('/:id/auto-bid', authenticate, requireRole(['buyer']), auctionController.setAutoBid);

export default router;
