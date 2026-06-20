import * as dynamoService from './dynamoService.js';
import * as MembershipModel from '../models/dynamodb/MembershipModel.js';
import { env } from '../config/env.js';
import { generateUUID } from '../utils/helpers.js';

const PLANS = {
  basic: {
    planId: 'basic',
    name: 'Basic',
    price: 0,
    durationDays: null,
    benefits: ['Browse properties', 'Save up to 10 properties', 'Basic support'],
  },
  premium: {
    planId: 'premium',
    name: 'Premium',
    price: 999,
    durationDays: 30,
    benefits: [
      'Join live auctions',
      'Save unlimited properties',
      'Priority legal document verification',
      'Dedicated support agent',
    ],
  },
  elite: {
    planId: 'elite',
    name: 'Elite',
    price: 2999,
    durationDays: 30,
    benefits: [
      'All Premium features',
      'Early access to luxury listings',
      'Free property valuation reports',
      'Concierge visit scheduling',
    ],
  },
};

export const getMembershipPlans = () => Object.values(PLANS);

export const getBuyerMembership = async (userId) => {
  const membership = await MembershipModel.getMembership(userId);
  if (!membership) {
    return { userId, plan: 'basic', expiryDate: null, benefits: PLANS.basic.benefits, isActive: true };
  }
  const now = new Date();
  const expired = membership.expiryDate && new Date(membership.expiryDate) < now;
  return {
    ...membership,
    isActive: !expired,
    benefits: PLANS[membership.plan]?.benefits ?? [],
  };
};

export const upgradeMembership = async (userId, planId) => {
  const plan = PLANS[planId];
  if (!plan) {
    const err = new Error(`Invalid plan. Valid plans: ${Object.keys(PLANS).join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  if (planId === 'basic') {
    const err = new Error('Cannot upgrade to basic plan');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + plan.durationDays);

  const membership = {
    userId,
    plan: planId,
    purchasedAt: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    transactionId: generateUUID(),
    status: 'active',
  };

  await MembershipModel.upsertMembership(membership);
  return { ...membership, benefits: plan.benefits };
};
