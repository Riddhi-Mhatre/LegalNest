import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logging.js';
import { env } from './config/env.js';

// Route imports
import authRoutes from './routes/v1/auth.routes.js';
import propertyRoutes from './routes/v1/property.routes.js';
import auctionRoutes from './routes/v1/auction.routes.js';
import userRoutes from './routes/v1/user.routes.js';
import chatRoutes from './routes/v1/chat.routes.js';
import membershipRoutes from './routes/v1/membership.routes.js';
import adminRoutes from './routes/v1/admin.routes.js';
import sellerRoutes from './routes/v1/seller.routes.js';
import buyerRoutes from './routes/v1/buyer.routes.js';

export const app = express();

// ─── Core Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(requestLogger);

// ─── Health Check ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes v1 ─────────────────────────────────────────
app.use('/v1/auth', authRoutes);
app.use('/v1/properties', propertyRoutes);
app.use('/v1/auctions', auctionRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/chat', chatRoutes);
app.use('/v1/memberships', membershipRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/seller', sellerRoutes);
app.use('/v1/buyer', buyerRoutes);

// ─── Global Error Handler ──────────────────────────────────
app.use(errorHandler);
