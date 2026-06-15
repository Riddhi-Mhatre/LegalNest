import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const authorize =
  (...roles: string[]) =>
  (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {

    const userRole =
      req.user?.role;

    if (
      !userRole ||
      !roles.includes(userRole)
    ) {

      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Access denied'
        }
      });

    }

    next();
  };