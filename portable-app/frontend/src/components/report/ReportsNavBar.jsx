import React, { useState } from "react";
import "../../assets/css/style.css";
import CheckoutReport from "./CheckoutReportDashboard.jsx";
import Modal from "../shared/Modal.jsx";

const NavBar = () => {
  const [date, setDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setIsModalOpen(true);
  };

  return (
    <div>
      <br>
      </br>
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
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            {reportData && <CheckoutReport data={reportData} />}
          </Modal>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
