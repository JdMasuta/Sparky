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

        // Fetch names for item_id, project_id, and user_id
        const fetchName = async (type, id) => {
          const res = await fetch(`/api/${type}/${id}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch ${type} name for id ${id}`);
          }
          const result = await res.json();
          return result.name || result.mo_num; // Adjust based on the API response structure
        };

        const formattedData = await Promise.all(
          data.map(async (entry) => {
            const itemName = await fetchName("item", entry.item_id);
            const mo_number = await fetchName("project", entry.project_id);
            const userName = await fetchName("user", entry.user_id);

            return {
              ...entry,
              item: itemName,
              project: mo_number,
              user: userName,
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
            };
          })
        );

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
