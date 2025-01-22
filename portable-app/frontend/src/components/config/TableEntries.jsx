import React, { useEffect, useState } from "react";
import useTableData from "./useTableData.jsx";

// This object maps each table name to its primary key field
const tableKeyMap = {
  users: "user_id",
  items: "item_id",
  projects: "project_id",
  checkouts: "checkout_id",
};

// A helper function that returns the correct primary key value
// for a given table and entry object:
function getIdForTable(table, entry) {
  const keyName = tableKeyMap[table];
  // If the table doesn't exist in our map, fall back to `entry.id`
  // or handle it however you need:
  return keyName ? entry[keyName] : entry.id;
}

function TableEntries({ table }) {
  const {
    tablesData,
    updateTable,
    preloadTables,
    fetchTableData,
    setTablesData,
  } = useTableData();

  const [newEntry, setNewEntry] = useState({});
  const [editing, setEditing] = useState(null);
  const entries = tablesData[table] || []; // Ensure entries is always an array
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Preload all tables once, if needed
  useEffect(() => {
    if (!isPreloaded) {
      console.log("Preloading tables...");
      preloadTables().then(() => setIsPreloaded(true));
    }
  }, [isPreloaded, preloadTables]);

  // Fetch the current table's data if it hasn't been fetched yet
  useEffect(() => {
    const fetchTableDataIfEmpty = async () => {
      if (!entries.length) {
        console.log(`Fetching data for table: ${table}`);
        const data = await fetchTableData(table);
        setTablesData((prev) => ({ ...prev, [table]: data }));
      }
    };

    fetchTableDataIfEmpty();
  }, [table, entries.length, fetchTableData, setTablesData]);

  const handleInputChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  if (!entries.length) {
    return <p>No data available for {table}.</p>; // Display a message when there's no data
  }

  return (
    <div className="table-entries">
      <div>
        <h4>{editing ? "Edit Entry" : "Add Entry"}</h4>
        {Object.keys(entries[0] || {}).map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={newEntry[field] || ""}
            onChange={handleInputChange}
          />
        ))}
        <button
          onClick={() =>
            editing
              ? updateTable(
                  table,
                  "edit",
                  newEntry,
                  getIdForTable(table, editing)
                )
              : updateTable(table, "add", newEntry)
          }
        >
          {editing ? "Save" : "Add"}
        </button>
      </div>

      <h3>{table.charAt(0).toUpperCase() + table.slice(1)} Entries</h3>
      <table>
        <thead>
          <tr>
            {entries[0] &&
              Object.keys(entries[0]).map((key) => <th key={key}>{key}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={getIdForTable(table, entry)}>
              {Object.values(entry).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
              <td>
                <button onClick={() => setEditing(entry)}>Edit</button>
                <button
                  onClick={() =>
                    updateTable(
                      table,
                      "delete",
                      null,
                      getIdForTable(table, entry)
                    )
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableEntries;
