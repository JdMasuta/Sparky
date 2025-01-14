// src/db/init.js
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import config from "../services/config/db.config.js";

let db = null;

const createTables = (db) => {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) DEFAULT 'USER',
      user_type VARCHAR(255) DEFAULT NULL
    );
  `);

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      project_id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_number VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL DEFAULT 'auto-insert',
      description TEXT DEFAULT NULL
    );
  `);

  // Create items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      description TEXT DEFAULT NULL,
      quantity_in_stock INTEGER DEFAULT 0
    );
  `);

  // Create checkouts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkouts (
      checkout_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      project_id INTEGER,
      item_id INTEGER,
      quantity INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (project_id) REFERENCES projects(project_id),
      FOREIGN KEY (item_id) REFERENCES items(item_id)
    );
  `);

  console.log("All tables created successfully");
};

export const initializeDatabase = () => {
  try {
    // Ensure the database directory exists
    const dbDir = path.dirname(config.filename);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create/open database
    db = new Database(config.filename, {
      verbose: config.verbose ? console.log : null,
      timeout: config.timeout,
    });

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // Create tables if they don't exist
    createTables(db);

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeDatabase() first."
    );
  }
  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
    console.log("Database connection closed");
  }
};
