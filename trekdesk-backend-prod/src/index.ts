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
 * WebSocket Router
 * Directs incoming voice/multimodal connections to the specialized
 * session handler. This module manages the bridge between the
 * client and the Google Gemini Multimodal Live API.
 */
wss.on("connection", handleVoiceConnection);

/**
 * Start Server
 * Begins listening for incoming HTTP/WebSocket traffic.
 */
server.listen(PORT, () => {
  logger.info(
    "----------------------------------------------------------------",
  );
  logger.info(`[TrekDesk Backend] Scalable MVP server is now LIVE`);
  logger.info(`[Status] Running on port: ${PORT}`);
  logger.info(`[Mode] ${env.NODE_ENV}`);
  logger.info(
    "----------------------------------------------------------------",
  );
});
