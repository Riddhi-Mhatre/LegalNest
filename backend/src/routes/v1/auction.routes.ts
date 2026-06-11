import { Router } from 'express';
import * as auctionController from '../../controllers/auctionController';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import { generalLimiter, bidLimiter } from '../../middleware/rateLimit';

const router = Router();

router.get('/', generalLimiter, auctionController.listAuctions);
router.get('/:id', generalLimiter, auctionController.getAuction);
router.get('/:id/bids', generalLimiter, auctionController.getBidHistory);
router.post('/:id/bid', authenticate, requireRole(['buyer']), bidLimiter, auctionController.placeBid);
router.post('/:id/auto-bid', authenticate, requireRole(['buyer']), auctionController.setAutoBid);

export default router;
