import React from "react";
import MainNavBar from "../components/shared/MainNavBar";
import logo from "../assets/images/BW Integrated Systems.png";

function Home() {
  return (
    <div className="container">
      <div className="logo-container">
        <img src={logo} alt="BW Integrated Systems" className="logo-image" />
      </div>
      <div>
        <MainNavBar />
      </div>
    </div>
  );
}

export default Home;
