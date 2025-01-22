import React, { useEffect } from "react";
import MainNavBar from "../components/shared/MainNavBar.jsx";
import logo from "../assets/images/BW Integrated Systems.png";
import EmailReports from "../components/config/EmailReports.jsx";
import DatabaseManagement from "../components/config/DatabaseManagement.jsx";
import useTableData from "../components/config/useTableData.jsx";

function Config() {
  const { preloadTables } = useTableData();

  useEffect(() => {
    preloadTables();
  }, [preloadTables]);

  return (
    <div>
      <div className="logo-container">
        <img src={logo} alt="BW Integrated Systems" className="logo-image" />
      </div>
      <MainNavBar />

      <div className="container">
        <h1 className="config-title">Settings</h1>

        <EmailReports />
        <DatabaseManagement />
      </div>
    </div>
  );
}

export default Config;
