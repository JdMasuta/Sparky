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
      console.log("Received monitoring data:", data);

      // Check if we have a successful response with finalQuantity
      if (data.success && data.finalQuantity !== undefined) {
        // console.log("Calling callback with quantity:", data.finalQuantity);
        await onQuantityReceived(data.finalQuantity);
      } else {
        console.log("No valid quantity received:", data);
      }

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
