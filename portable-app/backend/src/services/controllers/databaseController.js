// src/controllers/cableDataController.js
import { getDatabase } from "../../init/db.init.js";

// Method: Get all checkouts after a certain timestamp
export const getCheckoutsTimestamp = (req, res) => {
  const { timestamp } = req.body;

  if (!timestamp) {
    return res.status(400).send("Timestamp json parameter is required");
  }

  try {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT 
        checkout_id,
        user_id,
        project_id,
        item_id,
        quantity,
        strftime('%Y-%m-%d %H:%M:%S', timestamp) as timestamp 
      FROM checkouts 
      WHERE timestamp >= ?`
      )
      .all(timestamp);

    res.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching checkouts:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Get the latest n checkouts
export const getLatestCheckouts = (req, res) => {
  const { n } = req.params;

  if (!n || isNaN(n)) {
    return res
      .status(400)
      .send("Path parameter n is required and must be a number");
  }

  try {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT 
        checkout_id,
        user_id,
        project_id,
        item_id,
        quantity,
        strftime('%Y-%m-%d %H:%M:%S', timestamp) as timestamp
      FROM checkouts 
      ORDER BY timestamp DESC 
      LIMIT ?`
      )
      .all(parseInt(n));

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Method: Get a single checkout by checkout_id
export const getCheckoutById = (req, res) => {
  const { checkout_id } = req.body;

  if (!checkout_id) {
    return res.status(400).send("checkout_id query parameter is required");
  }

  try {
    const db = getDatabase();
    const row = db
      .prepare(
        `
      SELECT 
        checkout_id,
        user_id,
        project_id,
        item_id,
        quantity,
        strftime('%Y-%m-%d %H:%M:%S', timestamp) as timestamp
      FROM checkouts 
      WHERE checkout_id = ?`
      )
      .get(checkout_id);

    if (!row) {
      return res.status(404).send("Checkout not found");
    }
    res.json(row);
  } catch (error) {
    console.error("Error fetching checkout:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Create a new checkout
export const createCheckout = (req, res) => {
  const checkoutData = req.body;

  try {
    const db = getDatabase();
    const result = db
      .prepare(
        `
      INSERT INTO checkouts (user_id, project_id, item_id, quantity, timestamp) 
      VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        checkoutData.user_id,
        checkoutData.project_id,
        checkoutData.item_id,
        checkoutData.quantity,
        checkoutData.timestamp
      );

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error("Error creating checkout:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Create a new project
export const createProject = (req, res) => {
  const projectData = req.body;

  try {
    const db = getDatabase();
    const result = db
      .prepare("INSERT INTO projects (project_number) VALUES (?)")
      .run(projectData.project_number);

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Get user data by user_id
export const getUserById = (req, res) => {
  const userId = req.params.id;

  try {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM users WHERE user_id = ?").get(userId);

    if (row) {
      res.status(200).json({
        name: row.name,
        user_id: row.user_id,
        user_type: row.user_type,
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Get item data by item_id
export const getItemById = (req, res) => {
  const itemId = req.params.id;

  try {
    const db = getDatabase();
    const row = db
      .prepare("SELECT sku, name, description FROM items WHERE item_id = ?")
      .get(itemId);

    if (row) {
      res.status(200).json({
        sku: row.sku,
        name: row.name,
        description: row.description,
      });
    } else {
      res.status(404).send("Item not found");
    }
  } catch (error) {
    console.error("Error retrieving item:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Get project data by project_id
export const getProjectById = (req, res) => {
  const projectId = req.params.id;

  try {
    const db = getDatabase();
    const row = db
      .prepare(
        "SELECT project_number, name, description FROM projects WHERE project_id = ?"
      )
      .get(projectId);

    if (row) {
      res.status(200).json({
        project_number: row.project_number,
        name: row.name,
        description: row.description,
      });
    } else {
      res.status(404).send("Project not found");
    }
  } catch (error) {
    console.error("Error retrieving project:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Generate checkout report by timestamp
export const generateCheckoutReport = (req, res) => {
  const { timestamp } = req.body;

  if (!timestamp) {
    return res.status(400).send("Timestamp parameter is required");
  }

  try {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT 
        p.project_number,
        i.sku AS item_sku,
        i.name AS item_name,
        SUM(c.quantity) AS total_quantity
      FROM 
        checkouts c
      JOIN 
        projects p ON c.project_id = p.project_id
      JOIN 
        items i ON c.item_id = i.item_id
      WHERE 
        c.timestamp >= ?
      GROUP BY 
        p.project_number, i.sku, i.name
      ORDER BY 
        p.project_number, i.sku, i.name`
      )
      .all(timestamp);

    if (rows.length === 0) {
      return res
        .status(404)
        .send("No data found for the specified time period");
    }

    res.status(200).json({
      timestamp: timestamp,
      total_records: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Get table data
export const getTableData = (req, res) => {
  try {
    const db = getDatabase();
    const users = db.prepare("SELECT user_id, name FROM users").all();
    const projects = db
      .prepare("SELECT project_id, project_number FROM projects")
      .all();
    const items = db.prepare("SELECT item_id, sku FROM items").all();

    res.status(200).json({
      users,
      projects,
      items,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Delete invalid checkouts
export const deleteInvalidCheckouts = (req, res) => {
  try {
    const db = getDatabase();
    const result = db
      .prepare("DELETE FROM checkouts WHERE quantity = '0'")
      .run();

    res.status(200).json({
      message: "Invalid checkouts deleted",
      affectedRows: result.changes,
    });
  } catch (error) {
    console.error("Error deleting invalid checkouts:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Get latest checkouts with all related data
export const getLatestCheckoutsWithDetails = (req, res) => {
  const { n } = req.params;

  if (!n || isNaN(n)) {
    return res
      .status(400)
      .send("Path parameter n is required and must be a number");
  }

  try {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT 
        c.checkout_id,
        c.quantity,
        strftime('%Y-%m-%d %H:%M:%S', c.timestamp) as timestamp,
        u.user_id,
        u.name as user_name,
        p.project_id,
        p.project_number as mo_num,
        i.item_id,
        i.name as item_name,
        i.sku as item_sku
      FROM checkouts c
      JOIN users u ON c.user_id = u.user_id
      JOIN projects p ON c.project_id = p.project_id
      JOIN items i ON c.item_id = i.item_id
      ORDER BY c.timestamp DESC 
      LIMIT ?
    `
      )
      .all(parseInt(n));

    const formattedRows = rows.map((row) => ({
      checkout_id: row.checkout_id,
      quantity: row.quantity,
      timestamp: row.timestamp,
      user: {
        id: row.user_id,
        name: row.user_name,
      },
      project: {
        id: row.project_id,
        mo_num: row.mo_num,
      },
      item: {
        id: row.item_id,
        name: row.item_name,
        sku: row.item_sku,
      },
    }));

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error("Error fetching checkouts with details:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Get checkout statistics (today and week counts)
export const getCheckoutStats = (req, res) => {
  console.log("Getting checkout stats");
  try {
    const db = getDatabase();

    // Get today's start timestamp
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.toISOString().slice(0, 19).replace("T", " ");

    // Get week ago timestamp
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoTimestamp = weekAgo
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Single query to get both counts
    const stats = db
      .prepare(
        `
      SELECT 
        SUM(CASE WHEN timestamp >= ? THEN 1 ELSE 0 END) as today_count,
        SUM(CASE WHEN timestamp >= ? THEN 1 ELSE 0 END) as week_count
      FROM checkouts
    `
      )
      .get(todayTimestamp, weekAgoTimestamp);

    res.status(200).json({
      today_count: stats.today_count || 0,
      week_count: stats.week_count || 0,
    });
  } catch (error) {
    console.error("Error fetching checkout stats:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Method: Get checkouts after timestamp with details
export const getCheckoutsAfterTimestampWithDetails = (req, res) => {
  const { timestamp } = req.body;

  if (!timestamp) {
    return res.status(400).send("Timestamp parameter is required");
  }

  try {
    const db = getDatabase();
    const rows = db
      .prepare(
        `
      SELECT 
        c.checkout_id,
        c.quantity,
        strftime('%Y-%m-%d %H:%M:%S', c.timestamp) as timestamp,
        u.user_id,
        u.name as user_name,
        p.project_id,
        p.project_number as mo_num,
        i.item_id,
        i.name as item_name,
        i.sku as item_sku
      FROM checkouts c
      JOIN users u ON c.user_id = u.user_id
      JOIN projects p ON c.project_id = p.project_id
      JOIN items i ON c.item_id = i.item_id
      WHERE c.timestamp >= ?
      ORDER BY c.timestamp DESC
    `
      )
      .all(timestamp);

    const formattedRows = rows.map((row) => ({
      checkout_id: row.checkout_id,
      quantity: row.quantity,
      timestamp: row.timestamp,
      user: {
        id: row.user_id,
        name: row.user_name,
      },
      project: {
        id: row.project_id,
        mo_num: row.mo_num,
      },
      item: {
        id: row.item_id,
        name: row.item_name,
        sku: row.item_sku,
      },
    }));

    res.status(200).json(formattedRows);
  } catch (error) {
    console.error("Error fetching checkouts with details:", error);
    res.status(500).send("Internal Server Error");
  }
};
