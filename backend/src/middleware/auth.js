import { verifyJwt } from '../utils/jwt.js';
import { getUserByEmail } from '../models/dynamodb/UserModel.js';
import { HTTP } from '../utils/constants.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(HTTP.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'AUTH_001',
        message: 'No authentication token provided',
      },
    });
  }

  try {
    const decoded = await verifyJwt(token);

    if (!decoded.email || typeof decoded.email !== 'string') {
      throw new Error('Token does not contain an email');
    }

    const user = await getUserByEmail(decoded.email);

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(HTTP.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'AUTH_001',
        message: 'Invalid or expired token',
        details: err.message,
      },
    });
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return next();
  }
  try {
    const decoded = await verifyJwt(token);
    if (!decoded.email || typeof decoded.email !== 'string') {
      return next();
    }
    const user = await getUserByEmail(decoded.email);
    if (user) {
      req.user = { userId: user.userId, email: user.email, role: user.role };
    }
  } catch (err) {
    // ignore verification errors for optional auth
  }
  next();
};
