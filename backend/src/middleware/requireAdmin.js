// src/middleware/requireAdmin.js

import { HTTP } from '../utils/constants.js';

export const requireAdmin = (req, res, next) => {
  if (
    req.user?.email === process.env.ADMIN_EMAIL &&
    req.user?.role === 'admin'
  ) {
    return next();
  }

  return res.status(HTTP.FORBIDDEN || 403).json({
    success: false,
    error: {
      code: 'AUTH_003',
      message: 'Admin access required',
    },
  });
};