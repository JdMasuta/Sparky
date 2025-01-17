// ../components/entry/useRSLinxMonitor.jsx
import { useState } from "react";

export const useRSLinxMonitor = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState(null);

  const startMonitoring = async (onQuantityReceived) => {
    setIsMonitoring(true);
    setError(null);
    console.log("Monitoring PLC...");

    try {
      const response = await fetch("/api/rslinx/monitor");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.quantity !== undefined) {
        onQuantityReceived(data.quantity);
      }
      console.log("Monitoring complete:", data);
      return data;
    } catch (error) {
      console.error("Error monitoring PLC:", error);
      setError(error.message);
      return null;
    } finally {
      setIsMonitoring(false);
    }
  };

  return {
    startMonitoring,
    isMonitoring,
    error,
  };
};
