import opcda from "node-opc-da";
import config from "../services/config/rslinx.config.js";

let server = null;
let group = null;
let connected = false;
let connectionRetryCount = 0;
const MAX_RETRIES = 3;

export const initializeOPCDA = async () => {
  try {
    // If already connected, return true
    if (server && group && connected) {
      return true;
    }

    // Clean up any existing connections
    await disconnect();

    // Create OPC DA client
    const client = new opcda.Client();

    // Connect to the RSLinx server
    server = await client.connectServer({
      progId: config.progId, // e.g., 'RSLinx OPC Server'
      clsid: config.clsid, // RSLinx ClassID
    });

    console.log("Server connected");

    // Create a group for our items
    group = await server.addGroup({
      name: config.groupName || "DefaultGroup",
      updateRate: config.updateRate || 1000,
      deadband: config.deadband || 0,
    });

    console.log("Group created");

    connected = true;
    connectionRetryCount = 0;
    return true;
  } catch (error) {
    console.error("Failed to initialize OPC DA connection:", error.message);
    connected = false;

    if (connectionRetryCount >= MAX_RETRIES) {
      console.error("Max connection retries reached");
      throw new Error("Failed to establish connection after maximum retries");
    }

    connectionRetryCount++;
    return false;
  }
};

export const disconnect = async () => {
  try {
    if (group) {
      await group.remove();
      group = null;
      console.log("Group removed");
    }

    if (server) {
      await server.disconnect();
      server = null;
      console.log("Server disconnected");
    }

    connected = false;
  } catch (error) {
    console.error("Error during disconnect:", error.message);
    throw error;
  }
};

export const getServer = () => server;
export const getGroup = () => group;
export const isConnected = () => connected;

// Cleanup on process termination
process.on("SIGTERM", async () => {
  console.log("Termination signal received. Cleaning up...");
  await disconnect();
  process.exit(0);
});

export default {
  initializeOPCDA,
  disconnect,
  getServer,
  getGroup,
  isConnected,
};
