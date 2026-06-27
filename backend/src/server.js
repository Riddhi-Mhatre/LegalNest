import 'dotenv/config';
import { app } from './app.js';
import { initWebSocket } from './websocket/server.js';
import { createServer } from 'http';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';
import { provisionTables } from './config/dynamoTables.js';
import { startAuctionScheduler } from './services/auctionEngine.js';

const httpServer = createServer(app);

// Attach Socket.io
initWebSocket(httpServer);

// Provision DynamoDB tables before accepting traffic
provisionTables()
  .then(() => {
    // ✅ Start auction lifecycle scheduler after tables are ready
    startAuctionScheduler();

    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 LegalNest backend running on port ${env.PORT}`);
      logger.info(`📡 WebSocket server attached`);
      logger.info(`⏱️  Auction scheduler running`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    logger.error(`❌ Startup failed during table provisioning: ${err.message}`);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});
