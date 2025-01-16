import express from "express";
import {
  runDiagnostics,
  getTagValue,
  writeTagValue,
  getBatchTagValues,
  writeBatchTags,
  getConnectionStatus,
  reconnectRSLinx,
  validateTagConnection,
} from "../controllers/RSLinxController.js"; // DDE controller functions

const router = express.Router();

// Basic Tag Operations
router.get("/tags/:tagName", getTagValue);
router.post("/tags/:tagName", writeTagValue);

// Batch Operations
router.post("/batch/read", getBatchTagValues);
router.post("/batch/write", writeBatchTags);

// Connection Management
router.get("/status", getConnectionStatus);
router.post("/reconnect", reconnectRSLinx);
router.get("/validate/:tagName", validateTagConnection);

// Diagnostics
router.get("/diagnostics", runDiagnostics);

// Development Routes
if (process.env.NODE_ENV === "development") {
  // DDE Simulator for Development
  router.post("/simulator/start", (req, res) => {
    // Import DDE simulator dynamically only in development
    import("../tests/DDESimulator.js").then(({ default: DDESimulator }) => {
      const simulator = new DDESimulator();
      simulator
        .start()
        .then(() =>
          res.json({ success: true, message: "DDE Simulator started" })
        )
        .catch((error) => res.status(500).json({ error: error.message }));
    });
  });

  router.post("/simulator/stop", (req, res) => {
    import("../tests/DDESimulator.js").then(({ default: DDESimulator }) => {
      const simulator = new DDESimulator();
      simulator
        .stop()
        .then(() =>
          res.json({ success: true, message: "DDE Simulator stopped" })
        )
        .catch((error) => res.status(500).json({ error: error.message }));
    });
  });

  router.get("/simulator/status", (req, res) => {
    import("../tests/DDESimulator.js").then(({ default: DDESimulator }) => {
      const simulator = new DDESimulator();
      const status = simulator.getStatus();
      res.json(status);
    });
  });
}

export default router;
