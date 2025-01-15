// backend/src/server.js
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initializeDatabase, closeDatabase } from "./init/db.init.js";
import {
  serverConfig,
  securityConfig,
} from "./services/config/server.config.js";
import cableDataRoutes from "./services/routes/cableDataRoutes.js";
import errorHandler from "./services/middleware/errorHandler.js";

// Get the directory path for ES modules
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

const app = express();

// Ensure log directory exists
try {
  await fs.mkdir(serverConfig.paths.logs, { recursive: true });
} catch (err) {
  console.error("Failed to create logs directory:", err);
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
// app.use(express.static(join(currentDirPath, "../../frontend/dist")));

// Handle React routing by serving index.html for all unmatched routes
// app.get("*", (req, res) => {
//   res.sendFile(join(currentDirPath, "../../frontend/dist/index.html"));
// });

app.use(errorHandler);

// Setup logging based on environment
if (serverConfig.environment === "development") {
  const writeLog = async (message) => {
    try {
      await fs.appendFile(serverConfig.logging.file, message);
    } catch (err) {
      console.error("Failed to write to log file:", err);
    }
  };

  app.use(async (req, res, next) => {
    const logMessage = `${new Date().toISOString()} ${req.method} ${req.url}\n`;
    await writeLog(logMessage);
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

    // Error handling middleware
    app.use(async (err, req, res, next) => {
      const errorMessage = `${new Date().toISOString()} ERROR: ${err.stack}\n`;
      await fs.appendFile(serverConfig.logging.file, errorMessage);
      console.error(errorMessage);
      res.status(500).send("Something broke!");
    });

    // Start server
    const server = app.listen(serverConfig.port, async () => {
      const startMessage = `${new Date().toISOString()} Server running in ${
        serverConfig.environment
      } mode on port ${serverConfig.port}\n`;
      await fs.appendFile(serverConfig.logging.file, startMessage);
      console.log(startMessage.trim());
    });

    // Graceful shutdown
    const shutdown = async () => {
      const shutdownMessage = `${new Date().toISOString()} Server shutting down...\n`;
      await fs.appendFile(serverConfig.logging.file, shutdownMessage);
      console.log(shutdownMessage.trim());

      await closeDatabase();
      server.close(async () => {
        const closedMessage = `${new Date().toISOString()} Server closed\n`;
        await fs.appendFile(serverConfig.logging.file, closedMessage);
        console.log(closedMessage.trim());
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    const errorMessage = `${new Date().toISOString()} Failed to start server: ${error}\n`;
    await fs.appendFile(serverConfig.logging.file, errorMessage);
    console.error(errorMessage.trim());
    process.exit(1);
  }
};

await startServer();
