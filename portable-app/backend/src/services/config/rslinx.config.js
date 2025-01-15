// RSLinx OPC DA Configuration
const config = {
  // Server Settings
  progId: process.env.OPCDA_PROG_ID || "RSLinx OPC Server",
  clsid: process.env.OPCDA_CLSID || "{A0C90780-444E-11D1-B2B4-00A0C9267818}", // RSLinx Classic default CLSID

  // Group Settings
  groupName: process.env.OPCDA_GROUP_NAME || "DefaultGroup",
  updateRate: parseInt(process.env.OPCDA_UPDATE_RATE || "1000"), // milliseconds
  deadband: parseFloat(process.env.OPCDA_DEADBAND || "0"),

  // RSLinx Topic
  topic: process.env.RSLINX_TOPIC || "ExcelLink",

  // Tag Definitions - Using RSLinx Classic addressing format
  tags: {
    read: {
      quantity:
        "[" + (process.env.RSLINX_TOPIC || "ExcelLink") + "]Reel.RealData[0]",
      completeRequest:
        "[" +
        (process.env.RSLINX_TOPIC || "ExcelLink") +
        "]_200_GLB.BoolData[0].0",
      ddeTest: "[" + (process.env.RSLINX_TOPIC || "ExcelLink") + "]DDETest",
    },
    write: {
      userName:
        "[" +
        (process.env.RSLINX_TOPIC || "ExcelLink") +
        "]_200_GLB.StringData[0]",
      moNumber:
        "[" +
        (process.env.RSLINX_TOPIC || "ExcelLink") +
        "]_200_GLB.StringData[1]",
      itemNumber:
        "[" +
        (process.env.RSLINX_TOPIC || "ExcelLink") +
        "]_200_GLB.StringData[2]",
      completeAck:
        "[" + (process.env.RSLINX_TOPIC || "ExcelLink") + "]CompleteAck",
      stepNumber:
        "[" +
        (process.env.RSLINX_TOPIC || "ExcelLink") +
        "]_200_GLB.DintData[2]",
    },
  },

  // Data Type Mappings for CompactLogix
  // These are now mapped to OPC DA data types
  dataTypes: {
    userName: "VT_BSTR",
    moNumber: "VT_BSTR",
    itemNumber: "VT_BSTR",
    completeAck: "VT_BOOL",
    stepNumber: "VT_UI4",
    quantity: "VT_R4",
    completeRequest: "VT_BOOL",
    ddeTest: "VT_R4",
  },

  // Connection Settings
  connection: {
    maxRetries: parseInt(process.env.OPCDA_MAX_RETRIES || "3"),
    retryInterval: parseInt(process.env.OPCDA_RETRY_INTERVAL || "5000"),
  },

  // Cache Settings
  cache: {
    enabled: process.env.OPCDA_CACHE_ENABLED === "true",
    updateRate: parseInt(process.env.OPCDA_CACHE_UPDATE_RATE || "1000"),
  },
};

export default config;
