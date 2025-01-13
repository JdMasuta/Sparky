// Web Socket Server

// backend/src/services/config/server.config.js
export const serverConfig = {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Default Vite dev server port
    websocket: {
        path: '/ws',
        pingInterval: 30000,
        pingTimeout: 5000
    },
    environment: process.env.NODE_ENV || 'development',
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'server.log'
    }
};

export const securityConfig = {
    rateLimiting: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    cors: {
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
};

// Validate required environment variables
const requiredEnvVars = [];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
});