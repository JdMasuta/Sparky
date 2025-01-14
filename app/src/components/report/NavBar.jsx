import React, { useState } from "react";
import "../../assets/css/style.css";
import CheckoutReport from "./CheckoutReportDashboard";

const NavBar = () => {
  const [date, setDate] = useState("");
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = async () => {
    const response = await fetch("/api/checkout_report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timestamp: date }),
    });
    const data = await response.json();
    setReportData(data);
  };

  return (
    <nav className="nav">
      <div className="nav-content">
        <h1>BW Cable Audit System</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />
        <button
          onClick={handleGenerateReport}
          className="generate-report-button"
        >
          Generate Report
        </button>
        {reportData && <CheckoutReport data={reportData} />}
      </div>
    </nav>
  );
};

export default NavBar;
