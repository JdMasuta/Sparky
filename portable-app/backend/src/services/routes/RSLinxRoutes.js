import express from "express";
import {
  getTags,
  getTagValue,
  writeTagValue,
  writeBatchTags,
  getConnectionStatus,
  reconnectRSLinx,
  getBatchTagValues,
  validateTagConnection,
} from "../controllers/RSLinxController.js";

const router = express.Router();

// Basic Tag Operations
router.get("/tags", getTags);
router.get("/tags/:tagName", getTagValue);
router.post("/tags/:tagName", writeTagValue);

// Batch Operations
router.post("/batch/read", getBatchTagValues);
router.post("/batch/write", writeBatchTags);

// Connection Management
router.get("/status", getConnectionStatus);
router.post("/reconnect", reconnectRSLinx);
router.get("/validate/:tagName", validateTagConnection);

// Optional Simulator Routes (if using the simulator)
if (process.env.NODE_ENV === "development") {
  router.post("/simulator/start", (req, res) => {
    // Import simulator dynamically only in development
    import("../tests/PLCSimulator.js").then(({ default: PLCSimulator }) => {
      const simulator = new PLCSimulator();
      simulator
        .start()
        .then(() => res.json({ success: true, message: "Simulator started" }))
        .catch((error) => res.status(500).json({ error: error.message }));
    });
  });

  router.post("/simulator/stop", (req, res) => {
    // Import simulator dynamically only in development
    import("../tests/PLCSimulator.js").then(({ default: PLCSimulator }) => {
      const simulator = new PLCSimulator();
      simulator
        .stop()
        .then(() => res.json({ success: true, message: "Simulator stopped" }))
        .catch((error) => res.status(500).json({ error: error.message }));
    });
  });

  router.get("/simulator/status", (req, res) => {
    // Import simulator dynamically only in development
    import("../tests/PLCSimulator.js").then(({ default: PLCSimulator }) => {
      const simulator = new PLCSimulator();
      const status = simulator.getStatus();
      res.json(status);
    });
  });
}

export default router;
