import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./InventoryPage.module.css";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const InventoryPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get("/materials");
      setMaterials(res);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const totalItems = materials.length;
  const shortageItems = materials.filter((m) => m.status === "shortage").length;
  const surplusItems = materials.filter((m) => m.status === "surplus").length;
  const normalItems = materials.filter(
    (m) =>
      m.status === "normal" ||
      (!m.status &&
        m.currentQuantity >= 0.8 * m.averageMonthlyNeed &&
        m.currentQuantity <= 1.5 * m.averageMonthlyNeed)
  ).length;

  const filteredMaterials = materials.filter((mat) => {
    const matchesSearch = mat.name.toLowerCase().includes(search.toLowerCase());
    let matchesFilter = true;
    if (activeFilter === "shortage") matchesFilter = mat.status === "shortage";
    else if (activeFilter === "surplus")
      matchesFilter = mat.status === "surplus";
    else if (activeFilter === "normal")
      matchesFilter =
        mat.status === "normal" ||
        (!mat.status &&
          mat.currentQuantity >= 0.8 * mat.averageMonthlyNeed &&
          mat.currentQuantity <= 1.5 * mat.averageMonthlyNeed);
    return matchesSearch && matchesFilter;
  });

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

  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Inventory</h2>
        <p className="text-gray-600">
          Manage your food inventory and distribution
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Items</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {totalItems}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <i className="fas fa-boxes text-2xl text-green-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 flex items-center">
              <i className="fas fa-arrow-up mr-1"></i>{" "}
              {totalItems > 0
                ? (
                    ((totalItems - shortageItems - surplusItems) / totalItems) *
                    100
                  ).toFixed(1)
                : 0}
              % Normal
            </span>
            <p className="text-gray-500 text-sm mt-1">Since last month</p>
          </div>
        </div>
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Items in Shortage</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {shortageItems}
              </h3>
            </div>
            <div className="bg-red-50 p-3 rounded-full">
              <i className="fas fa-exclamation-circle text-2xl text-red-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-red-600 flex items-center">
              <i className="fas fa-arrow-up mr-1"></i> {shortageItems} items
            </span>
            <p className="text-gray-500 text-sm mt-1">Needs attention</p>
          </div>
        </div>
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Items in Surplus</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {surplusItems}
              </h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <i className="fas fa-arrow-up text-2xl text-blue-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-600 flex items-center">
              <i className="fas fa-arrow-up mr-1"></i> {surplusItems} items
            </span>
            <p className="text-gray-500 text-sm mt-1">Can be redistributed</p>
          </div>
        </div>
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Normal Stock</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {normalItems}
              </h3>
            </div>
            <div className="bg-gray-50 p-3 rounded-full">
              <i className="fas fa-check-circle text-2xl text-green-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-green-600 flex items-center">
              <i className="fas fa-check mr-1"></i> {normalItems} items
            </span>
            <p className="text-gray-500 text-sm mt-1">Stock is adequate</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by material name..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>
          <div>
            <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-200">
              <option>All Categories</option>
              <option>Staple Foods</option>
              <option>Perishables</option>
              <option>Special Items</option>
              <option>Relief Supplies</option>
              <option>Others</option>
            </select>
          </div>
          <div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`${
                  styles.filterBtn
                } px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 ${
                  activeFilter === "all" ? styles.active : ""
                }`}
                onClick={() => handleFilterClick("all")}
              >
                All
              </button>
              <button
                className={`${
                  styles.filterBtn
                } flex-grow sm:flex-grow-0 px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 ${
                  activeFilter === "normal" ? styles.active : ""
                }`}
                onClick={() => handleFilterClick("normal")}
              >
                ✅ Normal
              </button>
              <button
                className={`${
                  styles.filterBtn
                } flex-grow sm:flex-grow-0 px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 ${
                  activeFilter === "shortage" ? styles.active : ""
                }`}
                onClick={() => handleFilterClick("shortage")}
              >
                🔴 Shortage
              </button>
              <button
                className={`${
                  styles.filterBtn
                } flex-grow sm:flex-grow-0 px-3 py-1 rounded-lg border text-sm hover:bg-gray-50 ${
                  activeFilter === "surplus" ? styles.active : ""
                }`}
                onClick={() => handleFilterClick("surplus")}
              >
                🔵 Surplus
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Food Inventory
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="py-3 px-4 text-left">Material</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Quantity in Stock</th>
                  <th className="py-3 px-4 text-left">Avg. Monthly Need</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMaterials.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-6">
                      No materials found
                    </td>
                  </tr>
                )}
                {filteredMaterials.map((mat) => (
                  <tr
                    key={mat._id}
                    className={`${styles.inventoryItem} hover:bg-gray-50`}
                  >
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
                    <td className="py-4 px-4 font-medium">
                      {mat.currentQuantity} {mat.unit}
                    </td>
                    <td className="py-4 px-4">
                      {mat.averageMonthlyNeed} {mat.unit}
                    </td>
                    <td className="py-4 px-4">
                      {mat.status === "shortage" ? (
                        <span
                          className={`px-3 py-1 rounded-full ${styles.statusShortage} text-sm`}
                        >
                          <i className="fas fa-exclamation-circle mr-1"></i>{" "}
                          Shortage
                        </span>
                      ) : mat.status === "surplus" ? (
                        <span
                          className={`px-3 py-1 rounded-full ${styles.statusSurplus} text-sm`}
                        >
                          <i className="fas fa-arrow-up mr-1"></i> Surplus
                        </span>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full ${styles.statusNormal} text-sm`}
                        >
                          <i className="fas fa-check-circle mr-1"></i> Normal
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {mat.status === "shortage" ? (
                        <button className="text-green-600 hover:text-green-800 mr-3">
                          Request Aid
                        </button>
                      ) : (
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
                      )}
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

export default InventoryPage;
