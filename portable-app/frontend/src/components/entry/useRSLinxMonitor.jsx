import { useState, useRef } from "react";

export const useRSLinxMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState(null);
  const sessionIdRef = useRef(null);

  const startMonitoring = async (onQuantityReceived) => {
    const sessionId = `session-${Date.now()}`;
    sessionIdRef.current = sessionId;
    setIsMonitoring(true);
    setError(null);

    try {
      console.log("Starting monitoring session:", sessionId);
      const response = await fetch(`/api/rslinx/monitor/${sessionId}`, {
        method: "GET",
      });

      const data = await response.json();
      if (data.success) {
        await onQuantityReceived(data.finalQuantity);
      } else if (data.aborted) {
        console.log("Monitoring was aborted by the client.");
      } else {
        console.error("Monitoring did not complete successfully:", data);
      }
    } catch (err) {
      console.error("Error starting monitoring:", err);
      setError(err.message);
    } finally {
      setIsMonitoring(false);
      sessionIdRef.current = null;
    }
  };

  const stopMonitoring = async () => {
    if (!sessionIdRef.current) {
      console.warn("No active monitoring session to stop.");
      return;
    }

    try {
      console.log("Stopping monitoring session:", sessionIdRef.current);
      const response = await fetch("/api/rslinx/monitor/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("Monitoring session stopped successfully.");
      } else {
        console.error("Failed to stop monitoring:", data.error);
      }
    } catch (err) {
      console.error("Error stopping monitoring:", err);
      setError(err.message);
    } finally {
      sessionIdRef.current = null;
      setIsMonitoring(false);
    }
  };

  return {
    startMonitoring,
    stopMonitoring,
    isMonitoring,
    error,
  };
};
