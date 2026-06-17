import { logger } from '../utils/logger.js';
import { HTTP } from '../utils/constants.js';

export const errorHandler = (err, req, res, _next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // DynamoDB conditional check failure (race condition on bid)
  if (err.name === 'ConditionalCheckFailedException') {
    return res.status(HTTP.CONFLICT).json({
      success: false,
      error: { code: 'AUCTION_002', message: 'Bid was outpaced. Please try again.' },
    });
  }

  // Cognito errors
  if (err.name === 'NotAuthorizedException') {
    return res.status(HTTP.UNAUTHORIZED).json({
      success: false,
      error: { code: 'AUTH_002', message: 'Incorrect username or password' },
    });
  }

  if (err.name === 'UserNotConfirmedException') {
    return res.status(HTTP.BAD_REQUEST).json({
      success: false,
      error: { code: 'AUTH_003', message: 'Please verify your email address before signing in.' },
    });
  }

  if (err.name === 'UserNotFoundException') {
    return res.status(HTTP.BAD_REQUEST).json({
      success: false,
      error: { code: 'AUTH_004', message: 'User does not exist.' },
    });
  }

  if (err.message === 'User not found') {
    return res.status(HTTP.BAD_REQUEST).json({
      success: false,
      error: { code: 'AUTH_005', message: 'User record not found in database. Please register again.' },
    });
  }

  const statusCode = err.statusCode || HTTP.SERVER_ERROR;
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_001',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
    meta: { timestamp: new Date().toISOString() },
  });
};
