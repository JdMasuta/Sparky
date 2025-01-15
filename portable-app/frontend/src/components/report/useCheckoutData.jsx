import { useState, useEffect } from "react";

export const useCheckoutData = () => {
  const [initialData, setInitialData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true; // Flag to prevent setState after unmount

    const fetchData = async () => {
      try {
        // Fetch initial checkouts
        const response = await fetch("/api/checkouts/10", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Expected array of checkouts");
        }

        // Create Sets for unique IDs
        const uniqueItemIds = [...new Set(data.map((entry) => entry.item_id))];
        const uniqueProjectIds = [
          ...new Set(data.map((entry) => entry.project_id)),
        ];
        const uniqueUserIds = [...new Set(data.map((entry) => entry.user_id))];

        // Batch fetch all data
        const [itemNames, projectNames, userNames] = await Promise.all([
          Promise.all(
            uniqueItemIds.map((id) =>
              fetch(`/api/item/${id}`, { signal: controller.signal }).then(
                (res) => res.json()
              )
            )
          ),
          Promise.all(
            uniqueProjectIds.map((id) =>
              fetch(`/api/project/${id}`, { signal: controller.signal }).then(
                (res) => res.json()
              )
            )
          ),
          Promise.all(
            uniqueUserIds.map((id) =>
              fetch(`/api/user/${id}`, { signal: controller.signal }).then(
                (res) => res.json()
              )
            )
          ),
        ]);

        // Create lookup maps
        const itemMap = new Map(
          itemNames.map((item, i) => [uniqueItemIds[i], item.name])
        );
        const projectMap = new Map(
          projectNames.map((project, i) => [
            uniqueProjectIds[i],
            project.mo_num,
          ])
        );
        const userMap = new Map(
          userNames.map((user, i) => [uniqueUserIds[i], user.name])
        );

        if (!isActive) return; // Don't update state if component unmounted

        const formattedData = data.map((entry) => ({
          ...entry,
          item: itemMap.get(entry.item_id),
          project: projectMap.get(entry.project_id),
          user: userMap.get(entry.user_id),
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
        if (error.name === "AbortError") return;
        if (isActive) {
          console.error("Error fetching data:", error);
          setError(error.message);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  return { initialData, error };
};

// Custom debounce function
function createDebounce(func, wait) {
  let timeout;
  let controller;

  const debounced = (...args) => {
    // Cancel previous request if it exists
    if (controller) {
      controller.abort();
    }

    // Create new controller for this request
    controller = new AbortController();

    // Clear previous timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    return new Promise((resolve) => {
      timeout = setTimeout(async () => {
        try {
          const result = await func(...args, controller.signal);
          resolve(result);
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error(error);
          }
        }
      }, wait);
    });
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    if (controller) {
      controller.abort();
    }
  };

  return debounced;
}
