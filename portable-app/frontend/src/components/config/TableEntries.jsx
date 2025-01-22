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
  return keyName ? entry[keyName] : entry.id;
}

function TableEntries({ table }) {
  const {
    tablesData,
    updateTable,
    preloadTables,
    // fetchTableData, // Not needed if we always rely on preloaded data
    // setTablesData,  // Not needed for normal usage here unless you have special cases
  } = useTableData();

  const [newEntry, setNewEntry] = useState({});
  const [editing, setEditing] = useState(null);
  const entries = tablesData[table] || []; // Ensure entries is always an array

  const [isPreloaded, setIsPreloaded] = useState(false);

  /**
   * Preload ALL tables once on mount, if not already preloaded.
   * After this, we should have `tablesData` for every table in your app,
   * including the one specified by `table`.
   */
  useEffect(() => {
    if (!isPreloaded) {
      console.log("Preloading all tables...");
      preloadTables().then(() => setIsPreloaded(true));
    }
    // Only run once (or until isPreloaded = true)
  }, [isPreloaded, preloadTables]);

  /**
   * Handle form input for adding/editing an entry
   */
  const handleInputChange = (e) => {
    setNewEntry((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Early return if there's truly no data (empty array) for this table
   * or if preload hasn't happened yet. You can adjust this condition as needed.
   */
  if (!entries.length) {
    return (
      <p>
        No data available for <strong>{table}</strong>.
      </p>
    );
  }

  /**
   * Main component rendering
   */
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
          onClick={() => {
            if (editing) {
              updateTable(
                table,
                "edit",
                newEntry,
                getIdForTable(table, editing)
              );
            } else {
              updateTable(table, "add", newEntry);
            }
            // Clear out the form or close edit state, if desired
            setNewEntry({});
            setEditing(null);
          }}
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
