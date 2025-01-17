// ../components/entry/useRSLinxSequence.jsx
import { useState } from "react";

export const useRSLinxSequence = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendSequence = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rslinx/sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error sending sequence:", error);
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };

  return {
    sendSequence,
    isLoading,
    error,
  };
};
