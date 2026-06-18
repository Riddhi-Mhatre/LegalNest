import { verifyJwt } from '../utils/jwt.js';
import { getUserByEmail } from '../models/dynamodb/UserModel.js';
import { HTTP } from '../utils/constants.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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
    console.log("AUTH_MIDDLEWARE DECODED", decoded);
    console.log("ADMIN_EMAIL ENV VALUE", process.env.ADMIN_EMAIL);

    if (!decoded.email || typeof decoded.email !== 'string') {
      throw new Error('Token does not contain an email');
    }

    let user;
    try {
      user = await getUserByEmail(decoded.email);
    } catch (dbErr) {
      // Handle eventual consistency lag for admin user auto-provisioning
      if (decoded.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()) {
        user = {
          userId: 'admin-temp-id',
          email: decoded.email.toLowerCase(),
          role: 'admin'
        };
      } else {
        throw dbErr;
      }
    }

    const role =
      user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase()
        ? 'admin'
        : user.role;

    req.user = {
      userId: user.userId,
      email: user.email,
      role,
    };

    next();
  } catch (err) {
    return res.status(HTTP.UNAUTHORIZED).json({
      success: false,
      error: {
        code: 'AUTH_001',
        message: 'Invalid or expired token',
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
