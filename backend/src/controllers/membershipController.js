import { HTTP } from '../utils/constants.js';

// Membership plans
const PLANS = [
  { planId: 'buyer_monthly', name: 'Buyer Monthly', price: 499, duration: 30, role: 'buyer' },
  { planId: 'buyer_quarterly', name: 'Buyer Quarterly', price: 1199, duration: 90, role: 'buyer' },
  { planId: 'buyer_yearly', name: 'Buyer Yearly', price: 3999, duration: 365, role: 'buyer' },
  { planId: 'seller_basic', name: 'Seller Basic', price: 999, duration: 30, role: 'seller' },
  { planId: 'seller_premium', name: 'Seller Premium', price: 2499, duration: 30, role: 'seller' },
  { planId: 'seller_enterprise', name: 'Seller Enterprise', price: 5999, duration: 30, role: 'seller' },
];

// GET /v1/memberships/plans
export const getPlans = async (req, res, next) => {
  try {
    const { role } = req.query;
    const plans = role ? PLANS.filter(p => p.role === role) : PLANS;
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

// POST /v1/memberships/subscribe
export const createSubscription = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { planId } = req.body;
    // TODO: Integrate Razorpay/Stripe – for now return mock order
    res.status(HTTP.CREATED).json({
      success: true,
      data: {
        orderId: `order_${Date.now()}`,
        planId,
        userId,
        status: 'pending_payment',
        message: 'Payment gateway integration pending',
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /v1/memberships/webhook
export const handleWebhook = async (req, res, next) => {
  try {
    // TODO: Verify webhook signature, activate membership in DynamoDB
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
