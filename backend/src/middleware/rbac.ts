import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { HTTP } from '../utils/constants';

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP.UNAUTHORIZED).json({
        success: false,
        error: { code: 'AUTH_001', message: 'Not authenticated' },
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(HTTP.FORBIDDEN).json({
        success: false,
        error: { code: 'AUTH_003', message: `Access denied. Required role: ${roles.join(' or ')}` },
      });
    }
    next();
  };
};

export const authorize =
(...roles: string[]) =>
(req: any, res: any, next: any) => {

  const userRole =
    req.user.role;

  if(
    !roles.includes(userRole)
  ){
    return res.status(403).json({
      message:
      'Access denied'
    });
  }

  next();
};