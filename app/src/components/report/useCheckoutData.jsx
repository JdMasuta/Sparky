import { useState, useEffect } from "react";

export const useCheckoutData = () => {
  const [initialData, setInitialData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/checkouts/10", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Expected array of checkouts");
        }

        const formattedData = data.map((entry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
            .toLocaleString("sv-SE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })
            .replace(" ", "T")
            .replace("T", " "),
        }));

        setInitialData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  return { initialData, error };
};
