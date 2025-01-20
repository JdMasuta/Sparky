import React, { useEffect, useState } from "react";
import useTableData from "./useTableData.jsx";

function TableEntries({ table }) {
  const { tablesData, updateTable } = useTableData();
  const [newEntry, setNewEntry] = useState({});
  const [editing, setEditing] = useState(null);
  const entries = tablesData[table] || []; // Ensure entries is always an array

  useEffect(() => {
    if (!entries.length) {
      console.log(`Fetching data for table: ${table}`);
    }
  }, [table, entries]);

  const handleInputChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  if (!entries.length) {
    return <p>No data available for {table}.</p>; // Display a message when there's no data
  }

  return (
    <div className="table-entries">
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
            <tr key={entry.id}>
              {Object.values(entry).map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
              <td>
                <button onClick={() => setEditing(entry)}>Edit</button>
                <button
                  onClick={() => updateTable(table, "delete", null, entry.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
              ? updateTable(table, "edit", newEntry, editing.id)
              : updateTable(table, "add", newEntry)
          }
        >
          {editing ? "Save" : "Add"}
        </button>
      </div>
    </div>
  );
}

export default TableEntries;
