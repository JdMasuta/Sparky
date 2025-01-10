import { PLCConfig } from '../plc/plc.config.js';
import RSLinxBridge from '../plc/RSLinxBridge.js';
import { handleIncomingMessage } from './messageHandlers.js';
import WebSocket, { WebSocketServer as WSServer } from 'ws';

// 1. Add message type enum for better type safety
export const MessageType = {
    PLC_DATA: 'plcData',
    ERROR: 'error',
    WRITE_RESPONSE: 'writeResponse',
    READ_RESPONSE: 'readResponse',
    CONNECTION_STATUS: 'connectionStatus'
};

export class WebSocketServer {
    constructor(httpServer) {
        this.wss = null;
        this.httpServer = httpServer;
        this.plcBridge = new RSLinxBridge();
        this.clients = new Set();
        this.pollingIntervals = new Map();
        this.rsLinxStatus = false;
        this.statusCheckInterval = null;
    }

    initialize() {
        this.wss = new WSServer({ server: this.httpServer });
        this.setupWebSocketHandlers();
        this.startStatusMonitoring();
        console.log('WebSocket server initialized');
    }

    startStatusMonitoring() {
        this.statusCheckInterval = setInterval(async () => {
            const previousStatus = this.rsLinxStatus;
            this.rsLinxStatus = await this.plcBridge.checkConnection();
            
            if (previousStatus !== this.rsLinxStatus) {
                this.broadcast({
                    type: MessageType.CONNECTION_STATUS,
                    status: this.rsLinxStatus,
                    timestamp: Date.now()
                });
            }
        }, 5000); // Check every 5 seconds
    }

    setupDataPolling(ws) {
        // Placeholder implementation
        // Simulate setting up data polling and return an interval ID
        const intervalId = setInterval(() => {
            // Simulate polling data and sending it through the WebSocket
            const mockData = { timestamp: Date.now(), value: Math.random() };
            ws.send(JSON.stringify(mockData));
        }, 1000); // Poll every 1 second

        return intervalId;
    }

    async handleWriteOperation(ws, tagName, value) {
        try {
            await this.plcBridge.writeTag(tagName, value);
            ws.send(JSON.stringify({
                type: MessageType.WRITE_RESPONSE,
                success: true,
                tagName,
                timestamp: Date.now()
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: MessageType.ERROR,
                operation: 'write',
                tagName,
                error: error.message,
                timestamp: Date.now()
            }));
        }
    }

    setupWebSocketHandlers() {
        this.wss.on('connection', (ws) => {
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            console.log('New client connected');
            this.clients.add(ws);
            
            const intervalId = this.setupDataPolling(ws);
            this.pollingIntervals.set(ws, intervalId);
            
            ws.on('message', async (message) => {
                const response = await handleIncomingMessage(message, this.plcBridge);
                if (response && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(response));
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
                const intervalId = this.pollingIntervals.get(ws);
                if (intervalId) {
                    clearInterval(intervalId);
                    this.pollingIntervals.delete(ws);
                }
                this.clients.delete(ws);
            });
        });

        const heartbeat = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (ws.isAlive === false) {
                    this.handleDisconnection(ws);
                    return ws.terminate();
                }
                
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
        
        this.wss.on('close', () => {
            clearInterval(heartbeat);
        });
    }

    broadcast(message) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    async shutdown(timeout = 5000) {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
        }

        this.broadcast({
            type: MessageType.CONNECTION_STATUS,
            status: false,
            message: 'Server shutting down',
            timestamp: Date.now()
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const shutdownPromise = new Promise((resolve) => {
            let closedCount = 0;
            const totalClients = this.clients.size;

            this.clients.forEach(client => {
                client.on('close', () => {
                    closedCount++;
                    if (closedCount === totalClients) {
                        resolve();
                    }
                });
                client.close();
            });

            if (totalClients === 0) {
                resolve();
            }
        });

        await Promise.race([
            shutdownPromise,
            new Promise(resolve => setTimeout(resolve, timeout))
        ]);

        this.wss.close();
    }
}