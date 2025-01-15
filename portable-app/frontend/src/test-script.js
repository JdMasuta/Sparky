// browserTests.js
const RSLinxTester = {
  // Base URL for API calls
  baseUrl: "http://localhost:3000/api/rslinx",

  // Test connection status
  async testConnection() {
    console.log("Testing RSLinx connection...");
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      const data = await response.json();
      console.log("Connection status:", data);
      return data;
    } catch (error) {
      console.error("Connection test failed:", error);
      throw error;
    }
  },

  // Test reading a tag
  async testReadTag(tagName) {
    console.log(`Testing read of tag: ${tagName}`);
    try {
      const response = await fetch(`${this.baseUrl}/tags/${tagName}`);
      const data = await response.json();
      console.log("Tag value:", data);
      return data;
    } catch (error) {
      console.error("Read test failed:", error);
      throw error;
    }
  },

  // Test writing to a tag
  async testWriteTag(tagName, value) {
    console.log(`Testing write to tag: ${tagName} with value: ${value}`);
    try {
      const response = await fetch(`${this.baseUrl}/tags/${tagName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      });
      const data = await response.json();
      console.log("Write result:", data);
      return data;
    } catch (error) {
      console.error("Write test failed:", error);
      throw error;
    }
  },

  // Test batch read
  async testBatchRead(tags) {
    console.log("Testing batch read of tags:", tags);
    try {
      const response = await fetch(`${this.baseUrl}/batch/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      });
      const data = await response.json();
      console.log("Batch read results:", data);
      return data;
    } catch (error) {
      console.error("Batch read test failed:", error);
      throw error;
    }
  },

  // Test batch write
  async testBatchWrite(tags) {
    console.log("Testing batch write of tags:", tags);
    try {
      const response = await fetch(`${this.baseUrl}/batch/write`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      });
      const data = await response.json();
      console.log("Batch write results:", data);
      return data;
    } catch (error) {
      console.error("Batch write test failed:", error);
      throw error;
    }
  },

  // Test tag validation
  async testTagValidation(tagName) {
    console.log(`Testing validation of tag: ${tagName}`);
    try {
      const response = await fetch(`${this.baseUrl}/validate/${tagName}`);
      const data = await response.json();
      console.log("Validation result:", data);
      return data;
    } catch (error) {
      console.error("Validation test failed:", error);
      throw error;
    }
  },

  // Simulator controls (development only)
  async startSimulator() {
    console.log("Starting PLC simulator...");
    try {
      const response = await fetch(`${this.baseUrl}/simulator/start`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("Simulator start result:", data);
      return data;
    } catch (error) {
      console.error("Failed to start simulator:", error);
      throw error;
    }
  },

  async stopSimulator() {
    console.log("Stopping PLC simulator...");
    try {
      const response = await fetch(`${this.baseUrl}/simulator/stop`, {
        method: "POST",
      });
      const data = await response.json();
      console.log("Simulator stop result:", data);
      return data;
    } catch (error) {
      console.error("Failed to stop simulator:", error);
      throw error;
    }
  },

  async getSimulatorStatus() {
    console.log("Getting simulator status...");
    try {
      const response = await fetch(`${this.baseUrl}/simulator/status`);
      const data = await response.json();
      console.log("Simulator status:", data);
      return data;
    } catch (error) {
      console.error("Failed to get simulator status:", error);
      throw error;
    }
  },

  // Run all tests
  async runAllTests() {
    console.log("Running all RSLinx tests...");
    try {
      // Test connection
      await this.testConnection();

      // Get available tags
      const tagsResponse = await fetch(`${this.baseUrl}/tags`);
      const tagsData = await tagsResponse.json();

      // Test reading first available tag
      const readTag = Object.keys(tagsData.read)[0];
      await this.testReadTag(readTag);

      // Test writing to first writable tag
      const writeTag = Object.keys(tagsData.write)[0];
      await this.testWriteTag(writeTag, 42);

      // Test batch operations
      const batchReadTags = Object.keys(tagsData.read).slice(0, 2);
      await this.testBatchRead(batchReadTags);

      const batchWriteTags = {};
      Object.keys(tagsData.write)
        .slice(0, 2)
        .forEach((tag) => {
          batchWriteTags[tag] = 42;
        });
      await this.testBatchWrite(batchWriteTags);

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
