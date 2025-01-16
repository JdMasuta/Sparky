// RSLinxTester.js - Browser-based testing utility for DDE RSLinx implementation
const RSLinxTester = {
  // Base URL for API calls
  baseUrl: "http://localhost:3000/api/rslinx",

  // Test connection status
  async testConnection() {
    console.log("Testing DDE RSLinx connection...");
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      const data = await response.json();
      console.log("Connection status:", {
        connected: data.connected,
        server: data.server,
        topic: data.topic,
      });
      return data;
    } catch (error) {
      console.error("Connection test failed:", error);
      throw error;
    }
  },

  // Test reading a tag
  async testReadTag(tagName) {
    console.log(`Testing read of DDE tag: ${tagName}`);
    try {
      const encodedTag = encodeURIComponent(tagName);
      const response = await fetch(`${this.baseUrl}/tags/${encodedTag}`);
      const data = await response.json();

      if (response.ok) {
        console.log("Tag read successful:", {
          name: tagName,
          value: data.value,
          timestamp: data.timestamp,
        });
      } else {
        console.error("Tag read failed:", data.error);
      }

      return data;
    } catch (error) {
      console.error("Read test failed:", error);
      throw error;
    }
  },

  // Test writing to a tag
  async testWriteTag(tagName, value) {
    console.log(`Testing write to DDE tag: ${tagName} with value: ${value}`);
    try {
      const encodedTag = encodeURIComponent(tagName);
      const response = await fetch(`${this.baseUrl}/tags/${encodedTag}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log("Tag write successful:", {
          name: tagName,
          success: data.success,
          message: data.message,
        });
      } else {
        console.error("Tag write failed:", data.error);
      }

      return data;
    } catch (error) {
      console.error("Write test failed:", error);
      throw error;
    }
  },

  // Test batch read
  async testBatchRead(tags) {
    console.log("Testing batch read of DDE tags:", tags);
    try {
      const response = await fetch(`${this.baseUrl}/batch/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      });
      const data = await response.json();

      console.log("Batch read results:");
      Object.entries(data).forEach(([tag, result]) => {
        if (result.error) {
          console.error(`- ${tag}: Failed - ${result.error}`);
        } else {
          console.log(`- ${tag}: ${result.value} (${result.timestamp})`);
        }
      });

      return data;
    } catch (error) {
      console.error("Batch read test failed:", error);
      throw error;
    }
  },

  // Test batch write
  async testBatchWrite(tags) {
    console.log("Testing batch write of DDE tags:", tags);
    try {
      const response = await fetch(`${this.baseUrl}/batch/write`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      });
      const data = await response.json();

      console.log("Batch write results:");
      Object.entries(data).forEach(([tag, result]) => {
        if (result.error) {
          console.error(`- ${tag}: Failed - ${result.error}`);
        } else {
          console.log(`- ${tag}: Success`);
        }
      });

      return data;
    } catch (error) {
      console.error("Batch write test failed:", error);
      throw error;
    }
  },

  // Test tag validation
  async testTagValidation(tagName) {
    console.log(`Testing validation of DDE tag: ${tagName}`);
    try {
      const response = await fetch(`${this.baseUrl}/validate/${tagName}`);
      const data = await response.json();

      if (data.valid) {
        console.log(`Tag '${tagName}' is valid and accessible`);
      } else {
        console.error(`Tag '${tagName}' validation failed:`, data.error);
      }

      return data;
    } catch (error) {
      console.error("Validation test failed:", error);
      throw error;
    }
  },

  // DDE Simulator controls (development only)
  async startSimulator() {
    console.log("Starting DDE simulator...");
    try {
      const response = await fetch(`${this.baseUrl}/simulator/start`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("DDE Simulator start result:", data);
      return data;
    } catch (error) {
      console.error("Failed to start DDE simulator:", error);
      throw error;
    }
  },

  async stopSimulator() {
    console.log("Stopping DDE simulator...");
    try {
      const response = await fetch(`${this.baseUrl}/simulator/stop`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("DDE Simulator stop result:", data);
      return data;
    } catch (error) {
      console.error("Failed to stop DDE simulator:", error);
      throw error;
    }
  },

  async getSimulatorStatus() {
    console.log("Getting DDE simulator status...");
    try {
      const response = await fetch(`${this.baseUrl}/simulator/status`);
      const data = await response.json();
      console.log("DDE Simulator status:", data);
      return data;
    } catch (error) {
      console.error("Failed to get simulator status:", error);
      throw error;
    }
  },

  // Full Diagnostic
  async runDiagnostics() {
    console.log("Running DDE RSLinx diagnostics...");
    try {
      const response = await fetch(`${this.baseUrl}/diagnostics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Pretty print the results
      console.log("\nDDE RSLinx Diagnostic Results:");
      console.log("============================");

      // Configuration
      console.log("\nConfiguration:");
      console.log("--------------");
      Object.entries(data.configuration).forEach(([key, value]) => {
        console.log(`${key}: ${String(value)}`);
      });

      // Connection Status
      console.log("\nConnection Status:");
      console.log("-----------------");
      console.log(`Status: ${data.connection.status ? "Connected" : "Failed"}`);
      if (data.connection.error) {
        console.log(`Error: ${data.connection.error}`);
      }

      // Troubleshooting tips if there are issues
      if (!data.connection.status) {
        console.log("\nTroubleshooting steps:");
        console.log("1. Verify that RSLinx is running");
        console.log("2. Check if the DDE service is enabled in RSLinx");
        console.log("3. Verify the API server is running on port 3000");
        console.log(
          "4. Check that the Python DDE bridge is properly installed"
        );
        console.log("5. Verify windows DDE service is running");
      }

      return data;
    } catch (error) {
      console.error("Diagnostic test failed:", error.message);
      throw error;
    }
  },

  // Run all tests with specific tags
  async runAllTests(readTag, writeTag) {
    if (!readTag || !writeTag) {
      throw new Error("Both readTag and writeTag must be provided for testing");
    }

    console.log("Running all DDE RSLinx tests...");
    try {
      // Test connection
      await this.testConnection();

      // Test reading
      await this.testReadTag(readTag);

      // Test writing
      await this.testWriteTag(writeTag, 42);

      // Test batch operations
      await this.testBatchRead([readTag]);
      await this.testBatchWrite({ [writeTag]: 42 });

      // Test validation
      await this.testTagValidation(readTag);

      console.log("All tests completed successfully!");
    } catch (error) {
      console.error("Test suite failed:", error);
      throw error;
    }
  },
};

// Make it globally available in the browser
window.RSLinxTester = RSLinxTester;

// Usage example:
// RSLinxTester.runAllTests('_200_GLB.DintData[2]', '_200_GLB.DintData[3]');
