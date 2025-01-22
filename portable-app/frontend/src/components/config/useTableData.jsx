import { useState, useCallback } from "react";

function useTableData() {
  const [tablesData, setTablesData] = useState({
    users: [],
    projects: [],
    items: [],
    checkouts: [],
  });

  const fetchTableData = async (table) => {
    const url = `/api/${table}`;
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch(url, options).catch((err) =>
      console.error(err)
    );
    const data = await response.json();
    return data;
  };

  const preloadTables = useCallback(async () => {
    const users = await fetchTableData("users");
    const projects = await fetchTableData("projects");
    const items = await fetchTableData("items");
    const checkouts = await fetchTableData("checkouts");
    console.log("Preloading tables...");
    const reversedCheckouts = [...checkouts].reverse();
    console.log("checkouts: ", reversedCheckouts);
    setTablesData({ users, projects, items, reversedCheckouts });
  }, []);

  const updateTable = async (table, operation, entry, id = null) => {
    let response;
    const url = id ? `/api/${table}/${id}` : `/api/${table}`;
    const options = {
      headers: { "Content-Type": "application/json" },
    };

    if (operation === "add") {
      response = await fetch(url, {
        ...options,
        method: "POST",
        body: JSON.stringify(entry),
      });
    } else if (operation === "edit") {
      response = await fetch(url, {
        ...options,
        method: "PUT",
        body: JSON.stringify(entry),
      });
    } else if (operation === "delete") {
      response = await fetch(url, { ...options, method: "DELETE" });
    }

    if (response.ok) {
      const updatedData = await fetchTableData(table);
      setTablesData((prev) => ({ ...prev, [table]: updatedData }));
      console.log("Table: ", table, " updated successfully!");
    }
  };

  return {
    tablesData,
    preloadTables,
    updateTable,
  };
}

export default useTableData;
