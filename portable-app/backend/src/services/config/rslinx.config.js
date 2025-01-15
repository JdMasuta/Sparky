// RSLinx OPC UA Configuration
const config = {
  // Application Settings
  applicationName: "RSLinx_Web_Client",

  // Connection Settings
  endpointUrl: process.env.OPCDA_ENDPOINT || "opc.tcp://localhost:4840",

  connectionStrategy: {
    initialDelay: 1000,
    maxRetry: 3,
    maxDelay: 5000,
  },

  // Security Settings
  securityMode: "SignAndEncrypt", // Maps to MessageSecurityMode enum
  securityPolicy: "Basic256Sha256", // Maps to SecurityPolicy enum
  endpointMustExist: false,

  // Authentication
  auth: {
    username: process.env.OPCDA_USERNAME || "admin",
    password: process.env.OPCDA_PASSWORD || "password",
  },

  // RSLinx Topic
  topic: process.env.RSLINX_TOPIC || "ExcelLink",

  // Tag Definitions
  tags: {
    read: {
      quantity: "Reel.RealData[0]",
      completeRequest: "_200_GLB.BoolData[0].0",
      ddeTest: "DDETest",
    },
    write: {
      userName: "_200_GLB.StringData[0]",
      moNumber: "_200_GLB.StringData[1]",
      itemNumber: "_200_GLB.StringData[2]",
      completeAck: "CompleteAck",
      stepNumber: "_200_GLB.DintData[2]",
    },
  },

  // OPC UA Namespace Settings
  namespace: {
    index: 2, // Default namespace index for RSLinx tags
  },

  // Data Type Mappings for CompactLogix
  dataTypes: {
    userName: "String",
    moNumber: "String",
    itemNumber: "String",
    completeAck: "Boolean",
    stepNumber: "UInt32",
    quantity: "Float",
    completeRequest: "Boolean",
    ddeTest: "Float",
  },

  // Subscription Defaults
  subscription: {
    requestedPublishingInterval: 1000,
    requestedLifetimeCount: 100,
    requestedMaxKeepAliveCount: 10,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10,
  },

  // Monitoring Defaults
  monitoring: {
    samplingInterval: process.env.RSLINX_POLL_INTERVAL || 1000,
    discardOldest: true,
    queueSize: 10,
  },
};

export default config;
