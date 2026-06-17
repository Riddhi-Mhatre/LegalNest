import rateLimit from 'express-rate-limit';

// General: 100 req / 15 min
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_001', message: 'Too many requests, please try again later.' } },
});

// Bid-specific: 10 bids / 1 min
export const bidLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_002', message: 'Too many bids. Maximum 10 bids per minute.' } },
});

// Auth: 20 attempts / 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_003', message: 'Too many login attempts. Try again later.' } },
});
