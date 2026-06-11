import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logging';
import { env } from './config/env';

// Route imports
import authRoutes from './routes/v1/auth.routes';
import propertyRoutes from './routes/v1/property.routes';
import auctionRoutes from './routes/v1/auction.routes';
import userRoutes from './routes/v1/user.routes';
import chatRoutes from './routes/v1/chat.routes';
import membershipRoutes from './routes/v1/membership.routes';
import adminRoutes from './routes/v1/admin.routes';

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

// ─── Global Error Handler ──────────────────────────────────
app.use(errorHandler);
