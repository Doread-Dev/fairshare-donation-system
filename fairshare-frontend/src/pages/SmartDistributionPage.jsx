import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import BarChartFairness from "../components/BarChartFairness";
import styles from "./SmartDistributionPage.module.css";
import api from "../services/api";
import { useLocation } from "react-router-dom";

const SmartDistributionPage = () => {
  const [activeStrategy, setActiveStrategy] = useState("equal");
  const [materials, setMaterials] = useState([]);
  const [families, setFamilies] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [distributionSuggestions, setDistributionSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState("");
  const [executeSuccess, setExecuteSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const location = useLocation();
  const materialIdFromState = location.state?.materialId;

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/materials"), api.get("/families")])
      .then(([materialsRes, familiesRes]) => {
        setMaterials(materialsRes);
        setFamilies(familiesRes);
        if (materialIdFromState) {
          const found = materialsRes.find((m) => m._id === materialIdFromState);
          if (found) setSelectedMaterialId(found._id);
          else if (materialsRes.length > 0)
            setSelectedMaterialId(materialsRes[0]._id);
        } else if (materialsRes.length > 0) {
          setSelectedMaterialId(materialsRes[0]._id);
        }
      })
      .catch((err) => setError(err.message || "Failed to load data"))
      .finally(() => setLoading(false));
  }, [materialIdFromState]);

  useEffect(() => {
    if (!selectedMaterialId) return;
    setSuggestionLoading(true);
    setSuggestionError("");
    api
      .post("/distribution/suggest", {
        materialId: selectedMaterialId,
        strategy: activeStrategy,
      })
      .then((res) => {
        setDistributionSuggestions(res.suggestions || []);
      })
      .catch((err) => {
        setDistributionSuggestions([]);
        setSuggestionError(err.message || "Failed to fetch suggestions");
      })
      .finally(() => setSuggestionLoading(false));
  }, [selectedMaterialId, activeStrategy]);

  const selectedMaterial = materials.find((m) => m._id === selectedMaterialId);


  let fairnessScore = 100;
  let fairnessTooltip = "";
  if (activeStrategy === "equal") {
    fairnessScore = 40;
    fairnessTooltip =
      "Equal distribution: not optimal for fairness in this context.";
  } else if (activeStrategy === "priority") {
    fairnessScore = 92;
    fairnessTooltip =
      "Priority-based distribution: maximizes fairness for family needs.";
  }
  let fairnessLabels = distributionSuggestions.map((s) => s.familyName);
  let fairnessData = distributionSuggestions.map(
    (s) => Number(s.quantity) || 0
  );

  const filteredSuggestions = distributionSuggestions.filter((item) =>
    item.familyName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredSuggestions.length / itemsPerPage);
  const paginatedSuggestions = filteredSuggestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, distributionSuggestions]);

  const handleStrategyToggle = (strategy) => {
    setActiveStrategy(strategy);
  };

  const totalQuantityToDistribute = distributionSuggestions.reduce(
    (sum, s) => sum + (Number(s.quantity) || 0),
    0
  );
  const familiesCovered = distributionSuggestions.length;
  const avgPerFamily =
    familiesCovered > 0
      ? (totalQuantityToDistribute / familiesCovered).toFixed(2)
      : 0;

  const handleExecuteDistribution = async () => {
    if (!selectedMaterialId || distributionSuggestions.length === 0) return;
    setExecuteLoading(true);
    setExecuteError("");
    setExecuteSuccess("");
    try {
      await api.post("/distribution/execute", {
        materialId: selectedMaterialId,
        distributions: distributionSuggestions.map((s) => ({
          familyId: s.familyId,
          quantity: s.quantity,
        })),
        date: new Date().toISOString(),
      });
      setExecuteSuccess("Distribution executed successfully.");
    } catch (err) {
      setExecuteError(err.message || "Failed to execute distribution");
    } finally {
      setExecuteLoading(false);
    }
  };

  const houseColors = [
    "bg-purple-50 text-purple-600",
    "bg-blue-50 text-blue-600",
    "bg-green-50 text-green-600",
    "bg-orange-50 text-orange-600",
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Smart Distribution</h2>
        <p className="text-gray-600">
          Optimized food distribution based on family needs and priority
        </p>
      </div>

      {/* Distribution Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Distribution Settings */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Material Selection */}
          <div className={styles.distributionCard}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Select Material
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose material to distribute
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                disabled={loading || materials.length === 0}
              >
                <option value="" disabled>
                  Select a material
                </option>
                {materials.map((mat) => (
                  <option key={mat._id} value={mat._id}>
                    {mat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-gray-500">Available Quantity</p>
                <p className="text-xl font-bold text-gray-800">
                  {selectedMaterial
                    ? `${selectedMaterial.currentQuantity} ${selectedMaterial.unit}`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Families to Serve</p>
                <p className="text-xl font-bold text-gray-800">
                  {families.length > 0 ? `${families.length} families` : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Distribution Strategy */}
          <div className={styles.distributionCard}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Distribution Strategy
            </h3>
            <div className={`${styles.distributionToggle} mb-6`}>
              <div
                className={`${styles.toggleOption} ${
                  activeStrategy === "equal" ? styles.active : ""
                }`}
                onClick={() => handleStrategyToggle("equal")}
              >
                Equal Distribution
              </div>
              <div
                className={`${styles.toggleOption} ${
                  activeStrategy === "priority" ? styles.active : ""
                }`}
                onClick={() => handleStrategyToggle("priority")}
              >
                Priority-based
              </div>
            </div>

            <div className={activeStrategy === "equal" ? "" : "hidden"}>
              <p className="text-sm text-gray-600 mb-4">
                All families will receive equal amounts based on total available
                quantity.
              </p>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">
                  Each family will receive:{" "}
                  <span className="text-xl">
                    {avgPerFamily}{" "}
                    {selectedMaterial ? selectedMaterial.unit : ""}
                  </span>
                </p>
              </div>
            </div>

            <div className={activeStrategy === "priority" ? "" : "hidden"}>
              <p className="text-sm text-gray-600 mb-4">
                Distribution is prioritized based on family size, vulnerability,
                and past distributions.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                  <span className="text-sm">
                    Family size: Larger families get more
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                  <span className="text-sm">
                    Vulnerability index: Higher vulnerability gets priority
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                  <span className="text-sm">
                    Previous distributions: Less recently served get priority
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fairness Indicator */}
          <div className={`${styles.distributionCard} md:col-span-2`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Fairness Indicator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={styles.fairnessIndicator}>
                <div className={styles.fairnessScore} title={fairnessTooltip}>
                  {fairnessScore}%
                </div>
                <div className="text-lg font-medium text-gray-700">
                  Fairness Score
                </div>
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: fairnessScore + "%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {fairnessTooltip}
                </p>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Higher score indicates more equitable distribution based on
                  needs
                </p>
              </div>
              <div className="md:col-span-2">
                <div style={{ height: "400px" }}>
                  <BarChartFairness
                    labels={fairnessLabels}
                    data={fairnessData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Distribution Summary */}
        <div className={styles.distributionCard}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Distribution Summary
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Total Quantity to Distribute
              </p>
              <p className="text-xl font-bold text-gray-800">
                {totalQuantityToDistribute}{" "}
                {selectedMaterial ? selectedMaterial.unit : ""}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Families Covered</p>
              <p className="text-xl font-bold text-gray-800">
                {familiesCovered} / {families.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average per Family</p>
              <p className="text-xl font-bold text-gray-800">
                {avgPerFamily} {selectedMaterial ? selectedMaterial.unit : ""}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Predicted Impact</p>
              <div className="flex items-center mt-2">
                <div className="text-green-600 mr-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <p className="text-green-700">
                  {familiesCovered === families.length
                    ? "Covers all families"
                    : familiesCovered > 0
                    ? `Covers ${familiesCovered} families`
                    : "No families covered"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposed Distribution Table */}
      <div className={`${styles.distributionCard} mb-8`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Proposed Distribution
          </h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search families..."
                className="pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
              disabled
            >
              <i className="fas fa-filter"></i>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm">
                <th className="py-3 px-4 text-left">Family Name</th>
                <th className="py-3 px-4 text-left">Family Size</th>
                <th className="py-3 px-4 text-left">Vulnerability</th>
                <th className="py-3 px-4 text-left">Suggested Quantity</th>
                <th className="py-3 px-4 text-left">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suggestionLoading ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-6">
                    Loading suggestions...
                  </td>
                </tr>
              ) : suggestionError ? (
                <tr>
                  <td colSpan={5} className="text-center text-red-500 py-6">
                    {suggestionError}
                  </td>
                </tr>
              ) : paginatedSuggestions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-6">
                    No suggestions available
                  </td>
                </tr>
              ) : (
                paginatedSuggestions.map((item, famIdx) => {
                  let reason = "";
                  if (activeStrategy === "priority") {
                    if (item.familySize >= 5) reason = "Large family size";
                    else if (item.familySize >= 3) reason = "Medium family";
                    else reason = "Small family";
                    if (item.vulnerability >= 3)
                      reason += ", high vulnerability";
                    else if (item.vulnerability === 2)
                      reason += ", medium vulnerability";
                    else reason += ", low vulnerability";
                    if (
                      item.specialNeeds &&
                      Array.isArray(item.specialNeeds) &&
                      item.specialNeeds.length > 0
                    ) {
                      reason += `. Special needs: ${item.specialNeeds.join(
                        ", "
                      )}`;
                    } else {
                      reason += ". No special needs";
                    }
                  } else {
                    reason = "Equal share for all families.";
                  }
                  return (
                    <tr key={item.familyId} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-lg mr-3 ${
                              houseColors[famIdx % houseColors.length]
                            }`}
                          >
                            <i className="fas fa-house-user"></i>
                          </div>
                          {item.familyName}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <i className="fas fa-user text-gray-500 mr-1"></i>{" "}
                          {item.familySize}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.vulnerability >= 3
                              ? "bg-red-100 text-red-800"
                              : item.vulnerability === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.vulnerability}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-green-700">
                        {item.quantity}{" "}
                        {selectedMaterial ? selectedMaterial.unit : ""}
                      </td>
                      <td className="py-4 px-4 text-sm">{reason}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Showing {paginatedSuggestions.length} of{" "}
            {filteredSuggestions.length} families (Total:{" "}
            {distributionSuggestions.length})
          </p>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded-lg font-medium ${
                  currentPage === i + 1
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          className={styles.executeBtn}
          onClick={handleExecuteDistribution}
          disabled={executeLoading || distributionSuggestions.length === 0}
        >
          {executeLoading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i> Executing...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane mr-2"></i> Execute Distribution
            </>
          )}
        </button>
        {executeError && (
          <div className="text-red-600 mt-2">{executeError}</div>
        )}
        {executeSuccess && (
          <div className="text-green-600 mt-2">{executeSuccess}</div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SmartDistributionPage;
