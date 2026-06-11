import { api } from './api';

export const getPlans = (role?: string) =>
  api.get('/memberships/plans', { params: { role } }).then(r => r.data.data);

export const createSubscription = (planId: string) =>
  api.post('/memberships/subscribe', { planId }).then(r => r.data.data);
