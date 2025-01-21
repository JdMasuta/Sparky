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
  getTableData,
  deleteInvalidCheckouts,
  // New optimized methods
  getLatestCheckoutsWithDetails,
  getCheckoutStats,
  getCheckoutsAfterTimestampWithDetails,
  // New RESTful methods
  getAllData,
  getById,
  createEntry,
  updateEntry,
  deleteEntry,
} from "../controllers/databaseController.js";

const router = express.Router();

// Route: Get all checkouts on or after a given timestamp
router.post("/checkout_afterTime", getCheckoutsTimestamp);

// Route: Generate checkout report for entries after a given timestamp
router.post("/checkout_report", generateCheckoutReport);

// Route: Get a single checkout by checkout_id
router.get("/checkout_id/", getCheckoutById);

// Route: Get the latest 'n' checkouts
router.get("/checkouts/simple/:n", getLatestCheckouts);

// Route: Get user by user_id
router.get("/user/:id", getUserById);

// Route: Get project by project_id
router.get("/project/:id", getProjectById);

// Route: Get item by item_id
router.get("/item/:id", getItemById);

// Route: Get all users, projects, and items
router.get("/table_data", getTableData);

// Route: Create a new checkout
router.post("/checkout", createCheckout);

// Route: Create a new project
router.post("/project", createProject);

// Route: Delete all invalid checkouts
router.delete("/purge", deleteInvalidCheckouts);

// New optimized routes

// Route: Get the latest 'n' checkouts with detailed information
router.get("/checkouts/detailed/:n", getLatestCheckoutsWithDetails);

// Route: Get checkout statistics
router.get("/checkouts/stats", getCheckoutStats);

// Route: Get all checkouts on or after a given timestamp with detailed information
router.post("/checkouts/detailed/after", getCheckoutsAfterTimestampWithDetails);

// RESTful API

// General data retrieval
router.get("/:table", getAllData);

// CRUD operations for users
router.get("/users/:id", getById);
router.post("/users", createEntry);
router.put("/users/:id", updateEntry);
router.delete("/users/:id", deleteEntry);

// CRUD operations for projects
router.get("/projects/:id", getById);
router.post("/projects", createEntry);
router.put("/projects/:id", updateEntry);
router.delete("/projects/:id", deleteEntry);

// CRUD operations for items
router.get("/items/:id", getById);
router.post("/items", createEntry);
router.put("/items/:id", updateEntry);
router.delete("/items/:id", deleteEntry);

// CRUD operations for checkouts
router.get("/checkouts/:id", getById);
router.post("/checkouts", createEntry);
router.put("/checkouts/:id", updateEntry);
router.delete("/checkouts/:id", deleteEntry);

export default router;
