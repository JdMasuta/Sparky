// DEPRECIATED - This file is no longer used. It has been replaced by the RSLinxClient.js file in the app/src/services directory.
// Please migrate these methods to an API controller in the backend/src/controllers directory, and add the appropriate routes to the backend/src/routes directory.

// app/src/services/RSLinxClient.js
import { websocketConfig } from "./config/websocket.config";

class RSLinxClient {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.reconnectTimeout = null;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(websocketConfig.url);

    this.ws.onopen = () => {
      console.log("Connected to PLC WebSocket server");
      this.notifyListeners({ type: "connection", status: "connected" });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notifyListeners(data);
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.notifyListeners({ type: "connection", status: "disconnected" });
      this.scheduleReconnect();
    };
  }

  writeTag(tagName, value) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "write",
          tag: tagName,
          value,
        })
      );
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => callback(data));
  }

  scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, websocketConfig.reconnectInterval);
  }

  disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) this.ws.close();
  }
}

// Create singleton instance
const rslinxClient = new RSLinxClient();
export default rslinxClient;
