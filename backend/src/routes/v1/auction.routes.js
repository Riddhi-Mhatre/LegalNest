import { Router } from 'express';
import * as auctionController from '../../controllers/auctionController.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { generalLimiter, bidLimiter } from '../../middleware/rateLimit.js';
import { validate, bidSchema, autoBidSchema } from '../../validators/auction.validator.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
// Supports ?status=live or ?status=live,scheduled
router.get('/', generalLimiter, auctionController.listAuctions);
router.get('/:id', generalLimiter, auctionController.getAuction);
router.get('/:id/bids', generalLimiter, auctionController.getBidHistory);

// ── Buyer only ────────────────────────────────────────────────────────────────
router.post(
  '/:id/bid',
  authenticate,
  requireRole(['buyer']),
  bidLimiter,
  validate(bidSchema),          // ✅ validates amount before hitting controller
  auctionController.placeBid,
);

router.post(
  '/:id/auto-bid',
  authenticate,
  requireRole(['buyer']),
  generalLimiter,
  validate(autoBidSchema),      // ✅ validates maxAmount before hitting controller
  auctionController.setAutoBid,
);

export default router;
