import { useState, useCallback } from "react";

function useTableData() {
  const [tablesData, setTablesData] = useState({
    users: [],
    projects: [],
    items: [],
    checkouts: [],
  });

  const fetchTableData = async (table, limit) => {
    const url = `/api/${table}${limit ? `/simple/${limit}` : ""}`;
    console.log("Fetching data from:", url);
    const response = await fetch(url);
    return response.json();
  };

  const preloadTables = useCallback(async () => {
    const users = await fetchTableData("users");
    const projects = await fetchTableData("projects");
    const items = await fetchTableData("items");
    const checkouts = await fetchTableData("checkouts", 20);
    setTablesData({ users, projects, items, checkouts });
  }, []);

  const updateTable = async (table, operation, entry, id = null) => {
    let response;
    if (operation === "add") {
      response = await fetch(`/api/${table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } else if (operation === "edit") {
      response = await fetch(`/api/${table}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } else if (operation === "delete") {
      response = await fetch(`/api/${table}/${id}`, { method: "DELETE" });
    }

    if (response.ok) {
      const updatedData = await fetchTableData(
        table,
        table === "checkouts" ? 20 : undefined
      );
      setTablesData((prev) => ({ ...prev, [table]: updatedData }));
    }
  };

  return {
    tablesData,
    preloadTables,
    updateTable,
  };
}

export default useTableData;
