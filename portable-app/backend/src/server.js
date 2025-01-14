// backend/src/server.js
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { initializeDatabase, closeDatabase } from "./init/db.init.js";
import {
  serverConfig,
  securityConfig,
} from "./services/config/server.config.js";
import cableDataRoutes from "./services/routes/cableDataRoutes.js";
import errorHandler from "./services/middleware/errorHandler.js";

const app = express();

// Ensure log directory exists
if (!fs.existsSync(serverConfig.paths.logs)) {
  fs.mkdirSync(serverConfig.paths.logs, { recursive: true });
}

// Initialize rate limiter
const limiter = rateLimit(securityConfig.rateLimiting);

// Middleware setup
app.use(limiter);
app.use(
  cors({
    origin: serverConfig.corsOrigin,
    ...securityConfig.cors,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", cableDataRoutes);

// Serve static files from the frontend/dist directory
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// Handle React routing by serving index.html for all unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

app.use(errorHandler);

// Setup logging based on environment
if (serverConfig.environment === "development") {
  const logStream = fs.createWriteStream(serverConfig.logging.file, {
    flags: "a",
  });
  app.use((req, res, next) => {
    const logMessage = `${new Date().toISOString()} ${req.method} ${req.url}\n`;
    logStream.write(logMessage);
    console.log(logMessage.trim());
    next();
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    environment: serverConfig.environment,
    databasePath: serverConfig.paths.database,
  });
});

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Routes setup (to be added)
    // app.use('/api/v1', routes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      const errorMessage = `${new Date().toISOString()} ERROR: ${err.stack}\n`;
      fs.appendFileSync(serverConfig.logging.file, errorMessage);
      console.error(errorMessage);
      res.status(500).send("Something broke!");
    });

    // Start server
    const server = app.listen(serverConfig.port, () => {
      const startMessage = `Server running in ${serverConfig.environment} mode on port ${serverConfig.port}\n`;
      fs.appendFileSync(
        serverConfig.logging.file,
        `${new Date().toISOString()} ${startMessage}`
      );
      console.log(startMessage.trim());
    });

    // Graceful shutdown
    const shutdown = async () => {
      const shutdownMessage = `${new Date().toISOString()} Server shutting down...\n`;
      fs.appendFileSync(serverConfig.logging.file, shutdownMessage);
      console.log(shutdownMessage.trim());

      await closeDatabase();
      server.close(() => {
        const closedMessage = `${new Date().toISOString()} Server closed\n`;
        fs.appendFileSync(serverConfig.logging.file, closedMessage);
        console.log(closedMessage.trim());
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    const errorMessage = `${new Date().toISOString()} Failed to start server: ${error}\n`;
    fs.appendFileSync(serverConfig.logging.file, errorMessage);
    console.error(errorMessage.trim());
    process.exit(1);
  }
};

startServer();
