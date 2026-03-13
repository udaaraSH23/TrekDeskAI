/**
 * @file index.ts
 * @description TrekDesk AI Backend Entry Point. Bootstrap for HTTP/WebSocket servers.
 */

/**
 * TrekDesk AI - Backend Entry Point
 *
 * This file serves as the bootstrap for the TrekDesk AI Scalable MVP.
 * It initializes the HTTP server, attaches the WebSocket server for
 * real-time voice interactions, and starts listening for incoming requests.
 *
 * Modernized Architecture:
 * - Express Logic is encapsulated in ./app.ts
 * - WebSocket Session Logic is handled in ./sockets/voiceSession.ts
 */

import http from "http";
import { Server as WebSocketServer } from "ws";
import app from "./app";
import { handleVoiceConnection } from "./sockets/voiceSession";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import pool, { testConnection } from "./config/database";

/**
 * Initialize HTTP Server
 * Standard Node.js HTTP server is used to allow sharing the same
 * port between the Express REST API and the WebSocket server.
 */
const server = http.createServer(app);

/**
 * Initialize WebSocket Server
 * Attaches to the existing HTTP server instance.
 * All incoming WebSocket upgrades (e.g., from the web widget)
 * will be handled here.
 */
const wss = new WebSocketServer({ server });

// Server configuration
const PORT = env.PORT || 3001;

/**
 * WebSocket Router & Connection Monitoring
 * Directs incoming voice/multimodal connections to the specialized
 * session handler.
 */
wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  logger.info(`[WebSocket] New client connected from ${ip}`);

  // Handle the specialized session logic
  handleVoiceConnection(ws);

  ws.on("close", (code, reason) => {
    logger.info(
      `[WebSocket] Client ${ip} disconnected (Code: ${code}, Reason: ${reason || "none"})`,
    );
  });

  ws.on("error", (error) => {
    logger.error(`[WebSocket] Client ${ip} error: ${error.message}`);
  });
});

/**
 * Startup Logic
 * Orchestrates the initialization of all systems.
 */
const startServer = async () => {
  // 1. Start Listening immediately so Cloud Run health checks pass
  server.listen(PORT, async () => {
    logger.info(
      "----------------------------------------------------------------",
    );
    logger.info(`[TrekDesk Backend] Scalable MVP server is now LIVE`);
    logger.info(`[Service] API & WebSocket: Active`);
    logger.info(`[Status] Listening on port: ${PORT}`);
    logger.info(`[Mode] ${env.NODE_ENV}`);
    logger.info(
      "----------------------------------------------------------------",
    );

    // 2. Verify Database Connection in the background
    try {
      logger.info(`[Startup] Verifying database connectivity...`);
      await testConnection();
      logger.info(`[Startup] Database: OK (Connected)`);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "database is not connected"
      ) {
        logger.error(`[Startup] WARNING: Database is not connected yet.`);
      } else {
        logger.error(`[Startup] Unexpected error during DB check: ${error}`);
      }
      // Note: We don't exit(1) here anymore so Cloud Run keeps the container alive
      // while you fix the environment variables in the console.
    }
  });
};

/**
 * Graceful Shutdown Handling
 * Ensures that all resources are cleaned up before the process exits.
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);

  // 1. Close HTTP & WebSocket Server
  server.close(() => {
    logger.info(`[Shutdown] HTTP & WebSocket server closed.`);

    // 2. Drain and close DB Pool
    pool.end(() => {
      logger.info(`[Shutdown] Database pool closed.`);
      logger.info(`[Shutdown] Cleanup complete. Bye!`);
      process.exit(0);
    });
  });

  // Force exit if shutdown takes too long (10s)
  setTimeout(() => {
    logger.error(`[Shutdown] Forced shutdown due to timeout.`);
    process.exit(1);
  }, 10000);
};

// Start the sequence
startServer();

// Listen for termination signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
