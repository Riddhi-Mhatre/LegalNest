import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { getUserByEmail } from '../models/dynamodb/UserModel';
import { HTTP } from '../utils/constants';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(HTTP.UNAUTHORIZED).json({
      success: false,
      error: { code: 'AUTH_001', message: 'No authentication token provided' },
    });
  }
  try {
    const decoded = await verifyJwt(token);
    
    // We expect an ID token which contains the email
    if (!decoded.email || typeof decoded.email !== 'string') {
       throw new Error('Token does not contain an email');
    }

    const user = await getUserByEmail(decoded.email);
    
    req.user = { userId: user.userId, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(HTTP.UNAUTHORIZED).json({
      success: false,
      error: { code: 'AUTH_001', message: 'Invalid or expired token' },
    });
  }
};
