import {
  AttributeIds,
  DataType,
  StatusCodes,
  TimestampToReturn,
} from "node-opcua";
import config from "../config/rslinx.config.js";
import {
  initializeOPCUA,
  getSession,
  isConnected,
  disconnect,
  getActiveSubscriptions,
} from "../../init/rslinx.init.js";

// Get all configured tags
export const getTags = async (req, res) => {
  try {
    const allTags = {
      read: config.tags.read,
      write: config.tags.write,
    };
    res.json(allTags);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get tags", details: error.message });
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

    const session = getSession();
    if (!session) {
      await initializeOPCUA();
    }

    const nodeToRead = {
      nodeId: getNodeId(tag),
      attributeId: AttributeIds.Value,
    };

    const [dataValue] = await session.read([nodeToRead]);
    res.json({
      tagName,
      value: dataValue.value.value,
      timestamp: dataValue.sourceTimestamp,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to read tag", details: error.message });
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

    const session = getSession();
    if (!session) {
      await initializeOPCUA();
    }

    const nodeToWrite = {
      nodeId: getNodeId(tag),
      attributeId: AttributeIds.Value,
      value: {
        value: {
          dataType: getDataType(tagName),
          value: value,
        },
      },
    };

    const [statusCode] = await session.write([nodeToWrite]);

    if (statusCode !== StatusCodes.Good) {
      throw new Error(`Write failed with status: ${statusCode}`);
    }

    res.json({ success: true, message: "Tag written successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to write tag", details: error.message });
  }
};

// Get multiple tag values
export const getBatchTagValues = async (req, res) => {
  try {
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: "Tags must be an array" });
    }

    const session = getSession();
    if (!session) {
      await initializeOPCUA();
    }

    const nodesToRead = tags.map((tagName) => {
      const tag = config.tags.read[tagName] || config.tags.write[tagName];
      if (!tag) {
        throw new Error(`Tag not found: ${tagName}`);
      }
      return {
        nodeId: getNodeId(tag),
        attributeId: AttributeIds.Value,
      };
    });

    const dataValues = await session.read(nodesToRead);

    const results = tags.reduce((acc, tagName, index) => {
      acc[tagName] = {
        value: dataValues[index].value.value,
        timestamp: dataValues[index].sourceTimestamp,
      };
      return acc;
    }, {});

    res.json(results);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to read tags", details: error.message });
  }
};

// Write multiple tag values
export const writeBatchTags = async (req, res) => {
  try {
    const { tags } = req.body;

    if (!tags || typeof tags !== "object") {
      return res
        .status(400)
        .json({ error: "Tags must be an object mapping tagNames to values" });
    }

    const session = getSession();
    if (!session) {
      await initializeOPCUA();
    }

    const nodesToWrite = Object.entries(tags).map(([tagName, value]) => {
      const tag = config.tags.write[tagName];
      if (!tag) {
        throw new Error(`Tag not found or not writable: ${tagName}`);
      }
      return {
        nodeId: getNodeId(tag),
        attributeId: AttributeIds.Value,
        value: {
          value: {
            dataType: getDataType(tagName),
            value: value,
          },
        },
      };
    });

    const statusCodes = await session.write(nodesToWrite);

    const failedWrites = statusCodes
      .map((code, index) => ({ code, tagName: Object.keys(tags)[index] }))
      .filter(({ code }) => code !== StatusCodes.Good);

    if (failedWrites.length > 0) {
      throw new Error(`Failed to write tags: ${JSON.stringify(failedWrites)}`);
    }

    res.json({ success: true, message: "Tags written successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to write tags", details: error.message });
  }
};

// Get connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const status = {
      connected: isConnected(),
      topic: config.topic,
      sessionId: getSession()?.sessionId.toString() || null,
    };

    res.json(status);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get status", details: error.message });
  }
};

// Reconnect to RSLinx
export const reconnectRSLinx = async (req, res) => {
  try {
    await disconnect();
    const success = await initializeOPCUA();

    if (success) {
      res.json({ success: true, message: "Reconnected successfully" });
    } else {
      res.status(500).json({ error: "Failed to reconnect" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to reconnect", details: error.message });
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

    const session = getSession();
    if (!session) {
      await initializeOPCUA();
    }

    const nodeToRead = {
      nodeId: getNodeId(tag),
      attributeId: AttributeIds.Value,
    };

    const [dataValue] = await session.read([nodeToRead]);

    res.json({
      valid: dataValue.statusCode === StatusCodes.Good,
      statusCode: dataValue.statusCode.toString(),
      readable: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to validate tag", details: error.message });
  }
};

// Get active subscriptions
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = getActiveSubscriptions();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({
      error: "Failed to get subscriptions",
      details: error.message,
    });
  }
};

// Helper functions
function getNodeId(tag) {
  return `ns=${config.namespace.index};s=${tag}`;
}

function getDataType(tagName) {
  const typeString = config.dataTypes[tagName];
  return DataType[typeString];
}
