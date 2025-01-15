import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  UserTokenType,
  //TimestampToReturn,
} from "node-opcua";
import config from "../services/config/rslinx.config.js";

let client = null;
let session = null;
let connected = false;
let connectionRetryCount = 0;
const MAX_RETRIES = 3;

export const initializeOPCUA = async () => {
  try {
    // If already connected, return true
    if (client && client.isConnected() && session) {
      return true;
    }

    // Clean up any existing connections
    await disconnect();

    // Initialize client with options
    client = OPCUAClient.create({
      applicationName: config.applicationName,
      connectionStrategy: {
        initialDelay: 1000,
        maxRetry: MAX_RETRIES,
        maxDelay: 5000,
      },
      securityMode: MessageSecurityMode[config.securityMode],
      securityPolicy: SecurityPolicy[config.securityPolicy],
      endpointMustExist: false,
    });

    // Set up event handlers
    client.on("backoff", (retry, delay) => {
      console.warn(`Connection retry ${retry} in ${delay}ms`);
      connectionRetryCount = retry;
    });

    client.on("connection_lost", () => {
      console.error("Connection lost. Attempting to reconnect...");
      connected = false;
    });

    client.on("connection_reestablished", () => {
      console.log("Connection reestablished");
      connected = true;
    });

    // Connect to the server
    await client.connect(config.endpointUrl);
    console.log("Client connected");

    // Create session
    session = await client.createSession({
      userName: config.auth.username,
      password: config.auth.password,
      userIdentityInfo: {
        type: UserTokenType.UserName,
      },
    });
    console.log("Session created");

    connected = true;
    connectionRetryCount = 0;
    return true;
  } catch (error) {
    console.error("Failed to initialize OPC UA connection:", error.message);
    connected = false;

    if (connectionRetryCount >= MAX_RETRIES) {
      console.error("Max connection retries reached");
      throw new Error("Failed to establish connection after maximum retries");
    }

    return false;
  }
};

export const disconnect = async () => {
  try {
    if (session) {
      await session.close();
      session = null;
      console.log("Session closed");
    }

    if (client && client.isConnected()) {
      await client.disconnect();
      console.log("Client disconnected");
    }

    client = null;
    connected = false;
  } catch (error) {
    console.error("Error during disconnect:", error.message);
    throw error;
  }
};

export const getSession = () => session;
export const getClient = () => client;
export const isConnected = () => connected;

// Cleanup on process termination
process.on("SIGTERM", async () => {
  console.log("Termination signal received. Cleaning up...");
  await disconnect();
  process.exit(0);
});

export default {
  initializeOPCUA,
  disconnect,
  getSession,
  getClient,
  isConnected,
};
