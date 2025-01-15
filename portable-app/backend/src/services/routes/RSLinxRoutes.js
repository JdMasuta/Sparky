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
  getSubscriptions,
} from "../controllers/RSLinxController.js";

const router = express.Router();

// Basic Tag Operations
router.get("/tags", getTags);
router.get("/tags/:tagName", getTagValue);
router.post("/tags/:tagName", writeTagValue);

// Batch Operations
router.post("/tags/batch/read", getBatchTagValues);
router.post("/tags/batch/write", writeBatchTags);

// Connection Management
router.get("/status", getConnectionStatus);
router.post("/reconnect", reconnectRSLinx);
router.post("/validate/:tagName", validateTagConnection);

// Subscription Management
router.get("/subscriptions", getSubscriptions);

export default router;
