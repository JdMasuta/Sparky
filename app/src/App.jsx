import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Report from "./pages/Report.jsx";
import Home from "./pages/Home.jsx";
import Checkout from "./pages/Checkout.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/checkout" element={<Checkout />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;
