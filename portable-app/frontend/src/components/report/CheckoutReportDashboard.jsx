import React, { useState, useMemo } from "react";
import { ArrowUpDown } from "lucide-react";

const CheckoutReport = ({
  data = { timestamp: "", total_records: 0, data: [] },
}) => {
  const [sortField, setSortField] = useState("project_number");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedProject, setSelectedProject] = useState(null);

  // Calculate project totals and max quantity for scaling
  const projectStats = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) {
      return { stats: {}, maxTotal: 0 };
    }

    const stats = data.data.reduce((acc, item) => {
      const key = item.project_number;
      if (!acc[key]) {
        acc[key] = { total: 0, items: 0 };
      }
      // Convert string to number and handle invalid values
      const quantity = parseInt(item.total_quantity, 10) || 0;
      acc[key].total += quantity;
      acc[key].items += 1;
      return acc;
    }, {});

    const maxTotal = Math.max(...Object.values(stats).map((s) => s.total), 0);
    return { stats, maxTotal };
  }, [data]);

  // Sort function for table data
  const sortedData = useMemo(() => {
    if (!data?.data || !Array.isArray(data.data)) return [];

    return [...data.data].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;

      if (sortField === "total_quantity") {
        return dir * (parseInt(a[sortField], 10) - parseInt(b[sortField], 10));
      }

      return dir * String(a[sortField]).localeCompare(String(b[sortField]));
    });
  }, [data, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter data by selected project
  const filteredData = selectedProject
    ? sortedData.filter((item) => item.project_number === selectedProject)
    : sortedData;

  return (
    <div className="space-y-6">
      {/* Detailed Table Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Detailed Report</h2>
          {selectedProject && (
            <button
              onClick={() => setSelectedProject(null)}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th
                  onClick={() => handleSort("project_number")}
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    Project Number
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("item_sku")}
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    SKU
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("item_name")}
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    Item Name
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("total_quantity")}
                  className="px-4 py-3 text-right cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-end gap-2">
                    Total Quantity
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr
                  key={`${row.project_number}-${row.item_sku}-${index}`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{row.project_number}</td>
                  <td className="px-4 py-3">{row.item_sku}</td>
                  <td className="px-4 py-3">{row.item_name}</td>
                  <td className="px-4 py-3 text-right">
                    {parseInt(row.total_quantity, 10).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckoutReport;
