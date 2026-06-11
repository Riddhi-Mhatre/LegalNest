// Optional: Redis client for Socket.io horizontal scaling
// import { createClient } from 'redis';
// import { logger } from '../utils/logger';

// export const redisClient = createClient({ url: process.env.REDIS_URL });

// redisClient.on('error', (err) => logger.error('Redis error:', err));
// redisClient.connect();

// Placeholder – enable Redis only when scaling beyond single server
export const redisClient = null;
