import express from "express";
import {
  getLatestCheckouts,
  getCheckoutById,
  createCheckout,
  createProject,
  getCheckoutsTimestamp,
  getUserById,
  getItemById,
  getProjectById,
  generateCheckoutReport,
} from "../controllers/cableDataController.js";

const router = express.Router();

// Route: Get all checkouts on or after a given timestamp
router.post("/checkout_afterTime", getCheckoutsTimestamp);

// Route: Generate checkout report for entries after a given timestamp
router.post("/checkout_report", generateCheckoutReport);

// Route: Get a single checkout by checkout_id
router.get("/checkout_id/", getCheckoutById);

// Route: Get the latest 'n' checkouts
router.get("/checkouts/:n", getLatestCheckouts);

// Route: Get user by user_id
router.get("/user/:id", getUserById);

// Route: Get project by project_id
router.get("/project/:id", getProjectById);

// Route: Get item by item_id
router.get("/item/:id", getItemById);

// Route: Create a new checkout
router.post("/checkout", createCheckout);

// Route: Create a new project
router.post("/project", createProject);

export default router;
