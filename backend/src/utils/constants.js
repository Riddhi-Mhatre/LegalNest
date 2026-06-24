export const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
};

export const AUCTION_CONFIG = {
  SNIPE_WINDOW_MS: 2 * 60 * 1000, // 2 minutes
  MAX_EXTENSIONS: 10,
  DEFAULT_BID_INCREMENT: 10_000, // ₹10,000
};

export const ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
};

export const MEMBERSHIP_PLANS = {
  BUYER_MONTHLY: 'buyer_monthly',
  BUYER_QUARTERLY: 'buyer_quarterly',
  BUYER_YEARLY: 'buyer_yearly',
  SELLER_BASIC: 'seller_basic',
  SELLER_PREMIUM: 'seller_premium',
  SELLER_ENTERPRISE: 'seller_enterprise',
};
