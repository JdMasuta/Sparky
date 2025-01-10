// backend/src/server.js
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from './websocket/WebSocketServer.js';
import { serverConfig } from './config/server.config.js';

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = app.listen(serverConfig.port, () => {
    console.log(`Server running on port ${serverConfig.port}`);
});

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);
wsServer.initialize();