import React, { useState } from "react";
import NavBar from "../components/report/ReportsNavBar.jsx";
import StatCard from "../components/report/StatCard.jsx";
import CablePullsTable from "../components/report/CablePullsTable.jsx";
import { useCheckoutData } from "../components/report/useCheckoutData.jsx";
import FetchPullsData from "../components/report/useFetchPullsData.jsx";
import logo from "../assets/images/BW Integrated Systems.png";
import MainNavBar from "../components/shared/MainNavBar.jsx";

function App() {
  const { initialData, error } = useCheckoutData();
  const [todaysPulls, setTodaysPulls] = useState(0);
  const [weeksPulls, setWeeksPulls] = useState(0);

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div>
      <div className="logo-container">
        <img src={logo} alt="BW Integrated Systems" className="logo-image" />
      </div>
      <MainNavBar />
      <NavBar />
      <FetchPullsData
        setTodaysPulls={setTodaysPulls}
        setWeeksPulls={setWeeksPulls}
      />
      <div className="container">
        <div className="stats-grid">
          <StatCard
            title="Today's Pulls"
            value={todaysPulls}
            subtitle="Last updated just now"
          />
          <StatCard
            title="This Week's Pulls"
            value={weeksPulls}
            subtitle="Last updated just now"
          />
          <StatCard
            title="Active MOs"
            value="N/A"
            subtitle="Currently in progress"
          />
          <StatCard
            title="Pending Audit"
            value="N/A"
            subtitle="Requires review"
          />
          <StatCard title="Alerts" value="N/A" subtitle="Require Attention" />
        </div>
        <CablePullsTable initialData={initialData} />
      </div>
    </div>
  );
}

export default App;
