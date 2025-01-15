import config from "../config/rslinx.config.js";
import {
  initializeOPCDA,
  getServer,
  getGroup,
  isConnected,
  disconnect,
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

    const group = getGroup();
    if (!group) {
      await initializeOPCDA();
    }

    const item = await group.addItem({
      itemID: tag,
      active: true,
    });

    const value = await item.read();
    await item.remove();

    res.json({
      tagName,
      value: value.value,
      timestamp: value.timestamp,
      quality: value.quality,
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

    const group = getGroup();
    if (!group) {
      await initializeOPCDA();
    }

    const item = await group.addItem({
      itemID: tag,
      active: true,
    });

    await item.write(value);
    await item.remove();

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

    const group = getGroup();
    if (!group) {
      await initializeOPCDA();
    }

    const items = await Promise.all(
      tags.map(async (tagName) => {
        const tag = config.tags.read[tagName] || config.tags.write[tagName];
        if (!tag) {
          throw new Error(`Tag not found: ${tagName}`);
        }
        return group.addItem({
          itemID: tag,
          active: true,
        });
      })
    );

    const values = await group.readMultiple(items);
    await Promise.all(items.map((item) => item.remove()));

    const results = tags.reduce((acc, tagName, index) => {
      acc[tagName] = {
        value: values[index].value,
        timestamp: values[index].timestamp,
        quality: values[index].quality,
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

    const group = getGroup();
    if (!group) {
      await initializeOPCDA();
    }

    const items = await Promise.all(
      Object.entries(tags).map(async ([tagName, value]) => {
        const tag = config.tags.write[tagName];
        if (!tag) {
          throw new Error(`Tag not found or not writable: ${tagName}`);
        }
        const item = await group.addItem({
          itemID: tag,
          active: true,
        });
        return { item, value };
      })
    );

    await Promise.all(items.map(({ item, value }) => item.write(value)));
    await Promise.all(items.map(({ item }) => item.remove()));

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
    const server = getServer();
    const status = {
      connected: isConnected(),
      serverName: server?.name || null,
      groupName: getGroup()?.name || null,
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
    const success = await initializeOPCDA();

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

    const group = getGroup();
    if (!group) {
      await initializeOPCDA();
    }

    const item = await group.addItem({
      itemID: tag,
      active: true,
    });

    const value = await item.read();
    await item.remove();

    res.json({
      valid: value.quality === "GOOD",
      quality: value.quality,
      readable: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to validate tag", details: error.message });
  }
};
