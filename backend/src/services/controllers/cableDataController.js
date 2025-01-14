import mysql from "mysql2/promise";
import config from "../config/db.config.js";

/* Json checkout entry format: {
	"checkout_id": 3955,
	"user_id": 235,
	"project_id": 525,
	"item_id": 2,
	"quantity": 2,
	"timestamp": "2025-01-06 10:04:00"
} */

// Method: Get all checkouts after a certain timestamp
export const getCheckoutsTimestamp = async (req, res) => {
  const { timestamp } = req.body; // Get the timestamp from body

  if (!timestamp) {
    return res.status(400).send("Timestamp json parameter is required");
  }

  const connection = await mysql.createConnection(config.configString);
  try {
    // Convert the result timestamps to match database format
    const [rows] = await connection.execute(
      `SELECT 
                checkout_id,
                user_id,
                project_id,
                item_id,
                quantity,
                DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') as timestamp 
            FROM checkouts 
            WHERE timestamp >= ?`,
      [timestamp]
    );
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error fetching checkouts:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await connection.end();
  }
};

// Method: Get the latest n checkouts
export const getLatestCheckouts = async (req, res) => {
  const { n } = req.params; // Get the number of entries from path parameter

  if (!n || isNaN(n)) {
    return res
      .status(400)
      .send("Path parameter n is required and must be a number");
  }

  const connection = await mysql.createConnection(config.configString);
  try {
    const [rows] = await connection.execute(
      `SELECT 
                checkout_id,
                user_id,
                project_id,
                item_id,
                quantity,
                DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') as timestamp
                FROM checkouts ORDER BY timestamp DESC LIMIT ${parseInt(n)}` // Changed this line
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  } finally {
    await connection.end();
  }
};

// Method: Get a single checkout by checkout_id
export const getCheckoutById = async (req, res) => {
  const { checkout_id } = req.body; // Get the checkout_id from json body

  if (!checkout_id) {
    return res.status(400).send("checkout_id query parameter is required");
  }

  const connection = await mysql.createConnection(config.configString);
  if (!connection) {
    return res.status(500).send("Internal Server Error: stupid!");
  }
  try {
    const [rows] = await connection.execute(
      `SELECT 
                checkout_id,
                user_id,
                project_id,
                item_id,
                quantity,
                DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') as timestamp
                FROM checkouts WHERE checkout_id = ?`,
      [checkout_id]
    );
    if (rows.length === 0) {
      return res.status(404).send("Checkout not found");
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching checkout:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await connection.end();
  }
};

// Method: Create a new checkout
export const createCheckout = async (req, res) => {
  const checkoutData = req.body; // Get the checkout data from request body

  const connection = await mysql.createConnection(config.configString);
  try {
    const result = await connection.execute(
      "INSERT INTO checkouts (user_id, project_id, item_id, quantity, timestamp) VALUES (?, ?, ?, ?, ?)",
      [
        checkoutData.user_id,
        checkoutData.project_id,
        checkoutData.item_id,
        checkoutData.quantity,
        checkoutData.timestamp,
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Error creating checkout:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await connection.end();
  }
};

// Method: Create a new project
export const createProject = async (req, res) => {
  const projectData = req.body; // Get the project data from request body

  const connection = await mysql.createConnection(config);
  try {
    const result = await connection.execute("INSERT INTO projects SET ?", [
      projectData,
    ]);
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await connection.end();
  }
};

// New method to get user data by user_id
export const getUserById = async (req, res) => {
  const userId = req.params.id; // Get the user_id from path parameter
  const connection = await mysql.createConnection(config.configString);
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE user_id = ?",
      [userId]
    );
    if (rows.length > 0) {
      res.status(200).json({
        name: rows[0].name,
        user_id: rows[0].user_id,
        user_type: rows[0].user_type,
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await connection.end();
  }
};

// New method to get project name by project_id
export const getProjectById = async (req, res) => {
  const projectId = req.params.id;
  const connection = await mysql.createConnection(config.configString);
  try {
    const [rows] = await connection.execute(
      "SELECT project_number FROM projects WHERE project_id = ?",
      [projectId]
    );
    if (rows.length > 0) {
      res.status(200).json({ mo_num: rows[0].project_number });
    } else {
      res.status(404).send("Project not found");
    }
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await connection.end();
  }
};

// New method to get item name by item_id
export const getItemById = async (req, res) => {
  const itemId = req.params.id;
  const connection = await mysql.createConnection(config.configString);
  try {
    const [rows] = await connection.execute(
      "SELECT name FROM items WHERE item_id = ?",
      [itemId]
    );
    if (rows.length > 0) {
      res.status(200).json({ name: rows[0].name });
    } else {
      res.status(404).send("Item not found");
    }
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await connection.end();
  }
};

// Method: Generate checkout report by timestamp
export const generateCheckoutReport = async (req, res) => {
  const { timestamp } = req.body; // Get the timestamp from body

  if (!timestamp) {
    return res.status(400).send("Timestamp parameter is required");
  }

  const connection = await mysql.createConnection(config.configString);
  try {
    const [rows] = await connection.execute(
      `SELECT 
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
                p.project_number, i.sku, i.name`,
      [timestamp]
    );

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
  } finally {
    await connection.end();
  }
};

export const getTableData = async (req, res) => {
  const connection = await mysql.createConnection(config.configString);
  try {
    const usersQuery = `SELECT user_id, name FROM users`;
    const projectsQuery = `SELECT project_id, project_number FROM projects`;
    const itemsQuery = `SELECT item_id, sku FROM items`;

    const [users] = await connection.execute(usersQuery);
    const [projects] = await connection.execute(projectsQuery);
    const [items] = await connection.execute(itemsQuery);

    res.status(200).json({
      users,
      projects,
      items,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Method: Delete invalid checkouts
export const deleteInvalidCheckouts = async (req, res) => {
  const connection = await mysql.createConnection(config.configString);
  try {
    const result = await connection.execute(
      "DELETE FROM checkouts WHERE quantity = '0';"
    );
    res.status(200).json({
      message: "Invalid checkouts deleted",
      affectedRows: result[0].affectedRows,
    });
  } catch (error) {
    console.error("Error deleting invalid checkouts:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    await connection.end();
  }
};

// Add more methods as needed
