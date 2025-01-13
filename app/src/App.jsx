// import './App.css'
import React, { useEffect, useState } from "react";
import NavBar from "./components/report/NavBar.jsx";
import StatCard from "./components/report/StatCard.jsx";
import CablePullsTable from "./components/report/CablePullsTable.jsx";
import { useCheckoutData } from "./components/report/useCheckoutData.jsx";

const testData = [
  {
    timestamp: "11/27/2024 11:53",
    user: "JOSHUA MARTIN",
    moNumber: "M812670",
    item: "213876",
    quantity: "42",
    status: "Complete",
  },
  {
    timestamp: "11/27/2024 09:37",
    user: "DONALD CHAVEZ",
    moNumber: "M047540",
    item: "213876",
    quantity: "35",
    status: "Pending",
  },
  {
    timestamp: "11/26/2024 13:02",
    user: "JOSEPH KOELLER",
    moNumber: "M047540",
    item: "220602636",
    quantity: "58.957",
    status: "Complete",
  },
];

function App() {
  const { initialData, error } = useCheckoutData();

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="container">
        <div className="stats-grid">
          <StatCard
            title="Today's Pulls"
            value="47"
            subtitle="Last updated 5 min ago"
          />
          <StatCard
            title="Yesterday's Pulls"
            value="53"
            subtitle="Last updated 1 day ago"
          />
          <StatCard
            title="Active MOs"
            value="12"
            subtitle="Currently in progress"
          />
          <StatCard
            title="Pending Audit"
            value="3"
            subtitle="Requires review"
          />
          <StatCard title="Alerts" value="2" subtitle="Require Attention" />
        </div>
        <CablePullsTable initialData={initialData} />
      </div>
    </div>
  );
}

export default App;
