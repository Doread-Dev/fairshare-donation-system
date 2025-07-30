import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import StackedBarChart from "../components/StackedBarChart";
import styles from "./ReportsPage.module.css";
import api from "../services/api";

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState("30");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [appliedCustomFrom, setAppliedCustomFrom] = useState("");
  const [appliedCustomTo, setAppliedCustomTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [charts, setCharts] = useState(null);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let params = {};
        if (dateRange === "custom") {
          if (!appliedCustomFrom || !appliedCustomTo) {
            setLoading(false);
            return;
          }
          params.from = appliedCustomFrom;
          params.to = appliedCustomTo;
        } else {
          params.range = dateRange;
        }

        const [chartsRes, summaryRes] = await Promise.all([
          api.get("/reports/charts", params),
          api.get("/reports/summary", params),
        ]);
        setCharts(chartsRes);
        setSummary(summaryRes.summary || []);
      } catch (err) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange, appliedCustomFrom, appliedCustomTo]); 

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    setShowCustomRange(value === "custom");
    if (value !== "custom") {
      setCustomFrom("");
      setCustomTo("");
      setAppliedCustomFrom(""); 
      setAppliedCustomTo(""); 
    }
  };

  const handleCustomRangeApply = () => {
    if (customFrom && customTo) {
      setAppliedCustomFrom(customFrom);
      setAppliedCustomTo(customTo);
    }
  };

  const handleExport = async (format) => {
    try {
      let params = {};
      if (dateRange === "custom" && appliedCustomFrom && appliedCustomTo) {
        params.from = appliedCustomFrom;
        params.to = appliedCustomTo;
      } else {
        params.range = dateRange;
      }
      params.format = format;

      const blob = await api.getBlob("/reports/export", params);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `material-summary.${format === "excel" ? "xlsx" : format}`; 
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export report: " + (err.message || "Unknown error"));
    }
  };

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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Food Distribution Reports
          </h2>
          <p className="text-gray-600">
            Comprehensive analytics for donation tracking and distribution
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport("pdf")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <i className="fas fa-file-pdf mr-2"></i> Export PDF
          </button>
          <button
            onClick={() => handleExport("excel")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <i className="fas fa-file-excel mr-2"></i> Export Excel
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <h3 className="text-lg font-semibold text-gray-800">
            Filter Reports
          </h3>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center">
              <label className="mr-2 text-gray-600">Date Range:</label>
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            {showCustomRange && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center">
                  <label className="mr-2 text-gray-600">From:</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="mr-2 text-gray-600">To:</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  className="bg-green-600 text-white px-3 py-2 rounded-lg"
                  onClick={handleCustomRangeApply}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="text-center py-10 text-lg text-gray-500">
          Loading reports...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Donations per Material Chart */}
            <div className={`${styles.chartContainer} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Donations Received by Material
                </h3>
              </div>
              <div className="h-80">
                <BarChart
                  labels={charts?.donationsPerMaterial?.labels || []}
                  data={charts?.donationsPerMaterial?.data || []}
                />
              </div>
            </div>
            {/* Distribution Progress Chart */}
            <div className={`${styles.chartContainer} p-6`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Distribution Progress by Family Type
                </h3>
              </div>
              <div className="h-80">
                <LineChart
                  labels={charts?.distributionProgress?.labels || []}
                  datasets={charts?.distributionProgress?.datasets || []}
                />
              </div>
            </div>
            {/* Surplus/Shortage Chart (Full Width) */}
            <div className={`${styles.chartContainer} p-6 lg:col-span-2`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Material Surplus & Shortage Analysis
                </h3>
              </div>
              <div className="h-80">
                <StackedBarChart
                  labels={charts?.surplusShortage?.labels || []}
                  surplusData={charts?.surplusShortage?.surplusData || []}
                  shortageData={charts?.surplusShortage?.shortageData || []}
                />
              </div>
            </div>
          </div>
          {/* Summary Table */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Material Distribution Summary
              </h3>
              <div className="flex space-x-2">
                <button
                  className="text-green-600 hover:text-green-800 flex items-center"
                  onClick={() => window.print()}
                >
                  <i className="fas fa-print mr-1"></i> Print
                </button>
                <button
                  className="text-green-600 hover:text-green-800 flex items-center"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-sync-alt mr-1"></i> Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="py-3 px-4 text-left">Material</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-center">Donated (Units)</th>
                    <th className="py-3 px-4 text-center">
                      Distributed (Units)
                    </th>
                    <th className="py-3 px-4 text-center">Remaining (Units)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {summary.map((row, idx) => (
                    <tr key={idx} className={styles.tableRowHover}>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div
                            className="p-3 rounded-lg mr-3"
                            style={{
                              background:
                                categoryBgColors[row.category] || "#F3F4F6",
                            }}
                          >
                            {categoryIcons[row.category] || (
                              <i className="fas fa-box"></i>
                            )}
                          </div>
                          <span className="font-medium">
                            {row.material || row.Material}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{row.category}</td>
                      <td className="py-4 px-4 text-center font-medium">
                        {row.donated} {row.unit}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.distributed} {row.unit}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.remaining} {row.unit}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.status === "Shortage" ? (
                          <span
                            className={`px-3 py-1 rounded-full text-sm bg-red-100 text-red-800`}
                          >
                            <i className="fas fa-exclamation-circle mr-1"></i>{" "}
                            Shortage
                          </span>
                        ) : row.status === "Surplus" ? (
                          <span
                            className={`px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800`}
                          >
                            <i className="fas fa-arrow-up mr-1"></i> Surplus
                          </span>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-sm bg-green-100 text-green-800`}
                          >
                            <i className="fas fa-check-circle mr-1"></i> Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ReportsPage;
