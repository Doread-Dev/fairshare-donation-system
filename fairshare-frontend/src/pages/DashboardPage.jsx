import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import api from "../services/api";
import "@fortawesome/fontawesome-free";
import styles from "./DashboardPage.module.css";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [trendRange, setTrendRange] = useState(30);
  const navigate = useNavigate();

  const fetchData = (range = 30) => {
    setLoading(true);
    api
      .get(`/dashboard/summary?range=${range}`)
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load dashboard data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(trendRange);
  }, [trendRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96 text-xl text-gray-500">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96 text-xl text-red-500">
          {error}
        </div>
      </DashboardLayout>
    );
  }
  if (!data) return null;

  const { summary, stockByCategory, donationTrends, criticalItems } = data;

  const pieLabels = stockByCategory.map((c) => c.category);
  const pieData = stockByCategory.map((c) => c.quantity);
  const barLabels = donationTrends.labels;
  const barData = donationTrends.data;

  const trendOptions = [
    { label: "Last 30 Days", value: 30 },
    { label: "Last 90 Days", value: 90 },
    { label: "Last Year", value: 365 },
  ];

  const categoryIcons = {
    "Staple Food": <i className="fas fa-wheat-awn text-yellow-600"></i>,
    Perishable: <i className="fas fa-apple-alt text-green-600"></i>,
    "Special Items": <i className="fas fa-box text-red-600"></i>,
    "Relief Supplies": <i className="fas fa-truck text-blue-600"></i>,
    Others: <i className="fas fa-boxes text-gray-600"></i>,
  };
  const categoryBgColors = {
    "Staple Food": "#FEF3C7",
    Perishable: "#D1FAE5",
    "Special Items": "#FECACA",
    "Relief Supplies": "#DBEAFE",
    Others: "#F3F4F6",
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-600">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Donations</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {summary.totalDonations}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <i className="fas fa-hand-holding-heart text-2xl text-green-600"></i>
            </div>
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            Total number of donations received
          </div>
        </div>
        {/* Card 2 */}
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Current Stock</p>
              <div className="mt-2 space-y-1">
                {Object.entries(summary.totalStockByUnit).map(([unit, qty]) =>
                  qty > 0 ? (
                    <div
                      key={unit}
                      className="flex items-center text-gray-800 text-lg font-bold"
                    >
                      <span className="mr-2">{qty}</span>
                      {unit === "kg" && (
                        <span title="Kilograms" className="text-base">
                          <i className="fas fa-weight-hanging mr-1 text-green-700"></i>
                          kg
                        </span>
                      )}
                      {unit === "L" && (
                        <span title="Liters" className="text-base">
                          <i className="fas fa-tint mr-1 text-blue-700"></i>L
                        </span>
                      )}
                      {unit === "units" && (
                        <span title="Units" className="text-base">
                          <i className="fas fa-cube mr-1 text-gray-700"></i>
                          units
                        </span>
                      )}
                      {unit === "boxes" && (
                        <span title="Boxes" className="text-base">
                          <i className="fas fa-box mr-1 text-yellow-700"></i>
                          boxes
                        </span>
                      )}
                    </div>
                  ) : null
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">Total by unit</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <i className="fas fa-boxes text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>
        {/* Card 3 */}
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Registered Families</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {summary.registeredFamilies}
              </h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <i className="fas fa-users text-2xl text-purple-600"></i>
            </div>
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            Total number of families registered
          </div>
        </div>
        {/* Card 4 */}
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Active Alerts</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {summary.activeAlerts}
              </h3>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
            </div>
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            Number of active shortage/surplus alerts
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className={`${styles.chartContainer} p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Current Stock by Category
            </h3>
          </div>
          <div className="h-80">
            <PieChart labels={pieLabels} data={pieData} />
          </div>
        </div>
        {/* Bar Chart */}
        <div className={`${styles.chartContainer} p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Donation Trends
            </h3>
            <p className="0 border-none rounded-lg px-3 py-1 focus:outline-none">
              last 30 Days
            </p>
          </div>
          <div className="h-80">
            <BarChart labels={barLabels} data={barData} />
          </div>
        </div>
      </div>

      {/* Critical Items */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Materials in Critical State
        </h3>
        {criticalItems.length === 0 ? (
          <div className="text-gray-400">No critical items 🎉</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="py-3 px-4 text-left">Material</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Current Qty</th>
                  <th className="py-3 px-4 text-left">Required</th>
                  <th className="py-3 px-4 text-left">Unit</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {criticalItems.map((mat) => (
                  <tr key={mat.name} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div
                          className="p-3 rounded-lg mr-3"
                          style={{
                            background:
                              categoryBgColors[mat.category] || "#F3F4F6",
                          }}
                        >
                          {categoryIcons[mat.category] || (
                            <i className="fas fa-box"></i>
                          )}
                        </div>
                        <span className="font-medium">{mat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">{mat.category}</td>
                    <td className="py-4 px-4">{mat.currentQuantity}</td>
                    <td className="py-4 px-4">{mat.requiredLevel}</td>
                    <td className="py-4 px-4">{mat.unit}</td>
                    <td className="py-4 px-4">
                      {mat.status === "shortage" ? (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          Shortage
                        </span>
                      ) : mat.status === "surplus" ? (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold items-center">
                          <i className="fas fa-arrow-up mr-1"></i> Surplus
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold  items-center">
                          <i className="fas fa-check-circle mr-1"></i> Normal
                        </span>
                      )}
                    </td>
                    <td className="py-1 px-1">
                      {mat.status === "shortage" ? (
                        <button className="text-green-600 hover:text-green-800 mr-3">
                          Request Aid
                        </button>
                      ) : mat.status === "surplus" ? (
                        <button
                          className="text-green-600 hover:text-green-800 mr-3"
                          onClick={() =>
                            navigate(`/smart-distribution`, {
                              state: { materialId: mat._id },
                            })
                          }
                        >
                          Propose Redistribution
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
