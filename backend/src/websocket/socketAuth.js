import { verifyJwt } from '../utils/jwt.js';
import { getUserByEmail } from '../models/dynamodb/UserModel.js';

export const authenticateSocket = async (socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) return next(new Error('Authentication error: no token'));

  try {
    const decoded = await verifyJwt(token);

    if (!decoded.email || typeof decoded.email !== 'string') {
      return next(new Error('Authentication error: token has no email'));
    }

    const user = await getUserByEmail(decoded.email);

    socket.userId = user.userId;
    socket.userRole = user.role;
    next();
  } catch {
    next(new Error('Authentication error: invalid token'));
  }
};
