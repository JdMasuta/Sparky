import config from "../config/rslinx.config.js";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// DDE Manager class for handling Python bridge communication
class DDEManager {
  constructor() {
    this.pythonScript = join(__dirname, "dde_manager.py");
    this._connected = false;
  }

  formatDDELink(tagConfig) {
    return `[${config.topic}]${tagConfig.item},${tagConfig.row},${tagConfig.column}`;
  }

  async _executePythonCommand(command) {
    // If command contains a tag, format it as DDE link
    if (command.tag && typeof command.tag === "object") {
      command.tag = this.formatDDELink(command.tag);
    }

    return new Promise((resolve, reject) => {
      const python = spawn("python", [
        this.pythonScript,
        JSON.stringify(command),
      ]);

      let dataString = "";

      python.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      python.stderr.on("data", (data) => {
        console.error(`Python Error: ${data}`);
      });

      python.on("close", (code) => {
        try {
          const result = JSON.parse(dataString);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error("Failed to parse Python output"));
        }
      });
    });
  }

  async initialize() {
    const result = await this._executePythonCommand({
      action: "init",
      application: config.application,
      topic: config.topic,
    });
    this._connected = result.success;
    return result;
  }

  async disconnect() {
    const result = await this._executePythonCommand({ action: "disconnect" });
    this._connected = false;
    return result;
  }

  isConnected() {
    return this._connected;
  }
}

// Create singleton instance
const ddeManager = new DDEManager();

// Run diagnostic script
export const runDiagnostics = async (req, res) => {
  try {
    const diagnosticResults = {
      configuration: {
        server: config.application,
        topic: config.topic,
        connectionType: "DDE",
      },
      connection: {
        status: false,
        error: null,
      },
    };

    try {
      const result = await ddeManager.initialize();

      diagnosticResults.connection.status = result.success;
      if (!result.success) {
        diagnosticResults.connection.error = result.message;
      }

      // Test tag reading if configured
      if (config.tags.read.ddeTest) {
        const testResult = await ddeManager._executePythonCommand({
          action: "read",
          tag: config.tags.read.ddeTest,
        });

        diagnosticResults.tagTest = {
          status: !testResult.error,
          value: testResult.value,
          error: testResult.error,
          timestamp: new Date().toISOString(),
        };
      }

      await ddeManager.disconnect();
    } catch (connError) {
      diagnosticResults.connection.error = connError.message;
    }

    res.json(diagnosticResults);
  } catch (error) {
    console.error("Diagnostic error:", error);
    res.status(500).json({
      error: "Diagnostic test failed",
      details: error.message,
    });
  }
};

// Get all configured tags
export const getTags = async (req, res) => {
  try {
    const allTags = {
      read: config.tags.read,
      write: config.tags.write,
    };
    res.json(allTags);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get tags",
      details: error.message,
    });
  }
};

// Get value for specific tag
export const getTagValue = async (req, res) => {
  try {
    const { tagName } = req.params;
    const tag = config.tags.read[tagName] || config.tags.write[tagName];

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    const result = await ddeManager._executePythonCommand({
      action: "read",
      tag: tag,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    res.json({
      tagName,
      value: result.value,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to read tag",
      details: error.message,
    });
  }
};

// Write value to specific tag
export const writeTagValue = async (req, res) => {
  try {
    const { tagName } = req.params;
    const { value } = req.body;
    const tag = config.tags.write[tagName];

    if (!tag) {
      return res.status(404).json({ error: "Tag not found or not writable" });
    }

    const result = await ddeManager._executePythonCommand({
      action: "write",
      tag: tag,
      value: value,
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    res.json({ success: true, message: "Tag written successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to write tag",
      details: error.message,
    });
  }
};

// Get multiple tag values
export const getBatchTagValues = async (req, res) => {
  try {
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: "Tags must be an array" });
    }

    const results = {};
    for (const tagName of tags) {
      const tag = config.tags.read[tagName] || config.tags.write[tagName];
      if (!tag) {
        results[tagName] = { error: "Tag not found" };
        continue;
      }

      const result = await ddeManager._executePythonCommand({
        action: "read",
        tag: tag,
      });

      results[tagName] = {
        value: result.value,
        error: result.error,
        timestamp: new Date().toISOString(),
      };
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: "Failed to read tags",
      details: error.message,
    });
  }
};

// Write multiple tag values
export const writeBatchTags = async (req, res) => {
  try {
    const { tags } = req.body;

    if (!tags || typeof tags !== "object") {
      return res.status(400).json({
        error: "Tags must be an object mapping tagNames to values",
      });
    }

    const results = {};
    for (const [tagName, value] of Object.entries(tags)) {
      const tag = config.tags.write[tagName];
      if (!tag) {
        results[tagName] = { error: "Tag not found or not writable" };
        continue;
      }

      const result = await ddeManager._executePythonCommand({
        action: "write",
        tag: tag,
        value: value,
      });

      results[tagName] = {
        success: result.success,
        error: result.error,
      };
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: "Failed to write tags",
      details: error.message,
    });
  }
};

// Get connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const status = {
      connected: ddeManager.isConnected(),
      server: config.application,
      topic: config.topic,
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get status",
      details: error.message,
    });
  }
};

// Reconnect to RSLinx
export const reconnectRSLinx = async (req, res) => {
  try {
    await ddeManager.disconnect();
    const result = await ddeManager.initialize();

    if (result.success) {
      res.json({ success: true, message: "Reconnected successfully" });
    } else {
      res.status(500).json({
        error: "Failed to reconnect",
        message: result.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Failed to reconnect",
      details: error.message,
    });
  }
};

// Validate tag connection
export const validateTagConnection = async (req, res) => {
  try {
    const { tagName } = req.params;
    const tag = config.tags.read[tagName] || config.tags.write[tagName];

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    const result = await ddeManager._executePythonCommand({
      action: "validate",
      tag: tag,
    });

    res.json({
      valid: result.valid,
      error: result.error,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to validate tag",
      details: error.message,
    });
  }
};
