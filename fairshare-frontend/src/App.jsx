import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DonationsPage from "./pages/DonationsPage";
import InventoryPage from "./pages/InventoryPage";
import FamiliesPage from "./pages/FamiliesPage";
import SmartDistributionPage from "./pages/SmartDistributionPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { useAppContext } from "./contexts/AppContext";

const App = () => {
  const { isAuthenticated } = useAppContext();
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/donations" element={<DonationsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/families" element={<FamiliesPage />} />
        <Route path="/smart-distribution" element={<SmartDistributionPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
