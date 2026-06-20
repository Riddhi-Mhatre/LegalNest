import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import * as buyerController from '../../controllers/buyerController.js';

const router = Router();

// All buyer routes require JWT auth + buyer role
router.use(authenticate, requireRole(['buyer']));

// ─── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', buyerController.getDashboard);

// ─── Recommendations ───────────────────────────────────────────────────────────
router.get('/recommendations', buyerController.getRecommendations);

// ─── Saved Properties ──────────────────────────────────────────────────────────
router.post('/saved-properties/:propertyId', buyerController.saveProperty);
router.get('/saved-properties', buyerController.getSavedProperties);
router.delete('/saved-properties/:propertyId', buyerController.removeSavedProperty);

// ─── My Bids ──────────────────────────────────────────────────────────────────
router.get('/bids', buyerController.getMyBids);

// ─── Auction Participation ─────────────────────────────────────────────────────
router.get('/auctions', buyerController.listActiveAuctions);
router.get('/auctions/:auctionId', buyerController.getAuction);
router.post('/auctions/:auctionId/bid', buyerController.placeBid);

// ─── Property Visits ───────────────────────────────────────────────────────────
router.post('/visits', buyerController.scheduleVisit);
router.get('/visits', buyerController.getVisits);
router.put('/visits/:visitId', buyerController.updateVisit);
router.delete('/visits/:visitId', buyerController.cancelVisit);

// ─── Legal Documents ───────────────────────────────────────────────────────────
router.get('/properties/:propertyId/documents', buyerController.getPropertyDocuments);
router.get('/properties/:propertyId/legal-report', buyerController.getLegalReport);

// ─── Purchased Properties ─────────────────────────────────────────────────────
router.get('/purchases', buyerController.getPurchases);

// ─── Membership ────────────────────────────────────────────────────────────────
router.get('/membership', buyerController.getMembership);
router.post('/membership/upgrade', buyerController.upgradeMembership);

// ─── Notifications ────────────────────────────────────────────────────────────
router.get('/notifications', buyerController.getNotifications);
router.put('/notifications/:notificationId/read', buyerController.markNotificationRead);
router.delete('/notifications/:notificationId', buyerController.deleteNotification);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get('/profile', buyerController.getProfile);
router.put('/profile', buyerController.updateProfile);

export default router;
