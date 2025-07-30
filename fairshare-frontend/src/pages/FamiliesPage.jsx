import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./FamiliesPage.module.css";
import api from "../services/api";

const FamiliesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(4);
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    api
      .get("/families")
      .then((res) => setFamilies(res))
      .catch((err) => setError(err.message || "Failed to load families"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddFamily = () => {
    setIsModalOpen(true);
  };

  const [editId, setEditId] = useState(null);
  const handleEditFamily = (fam) => {
    setEditId(fam._id);
    setIsModalOpen(true);
    setMemberCount(fam.familySize);
    setLocation(fam.area || "");
    const presetNeeds = [];
    const otherNeedsArr = [];
    if (Array.isArray(fam.specialNeeds)) {
      fam.specialNeeds.forEach((n) => {
        if (specialNeedsOptions.includes(n)) {
          presetNeeds.push(n);
        } else if (typeof n === "string" && n.trim()) {
          otherNeedsArr.push(n.trim());
        }
      });
    }
    setSelectedNeeds(() => {
      if (otherNeedsArr.length > 0) {
        return [...presetNeeds, 'Others'];
      }
      return presetNeeds.length > 0 ? presetNeeds : [];
    });
    setOtherNeed(otherNeedsArr.join(', '));
    setTimeout(() => {
      if (document.getElementById("familyName")) {
        document.getElementById("familyName").value = fam.name;
      }
    }, 0);
  };

  const handleSaveFamily = async () => {
    const familyName = document.getElementById("familyName")?.value;
    let specialNeeds = selectedNeeds.slice();
    if (selectedNeeds.includes("Others") && otherNeed.trim()) {
      specialNeeds = specialNeeds.filter((n) => n !== "Others");
      const needsArr = otherNeed
        .split(/,|،/)
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      specialNeeds.push(...needsArr);
    }
    if (!familyName) {
      alert("Please enter a family name");
      return;
    }
    try {
      if (editId) {
        await api.put(`/families/${editId}`, {
          name: familyName,
          familySize: memberCount,
          area: location,
          specialNeeds,
        });
      } else {
        await api.post("/families", {
          name: familyName,
          familySize: memberCount,
          area: location,
          specialNeeds,
        });
      }
      const updated = await api.get("/families");
      setFamilies(updated);
      alert(`Family \"${familyName}\" saved successfully!`);
      if (document.getElementById("familyForm")) {
        document.getElementById("familyForm").reset();
      }
      setMemberCount(4);
      setSelectedNeeds([]);
      setOtherNeed("");
      setEditId(null);
      handleCloseModal();
    } catch (err) {
      alert(err.message || "Failed to save family");
    }
  };

  const changeMemberCount = (delta) => {
    const newCount = memberCount + delta;
    if (newCount >= 1 && newCount <= 20) {
      setMemberCount(newCount);
    }
  };

  const handleLocationInput = (value) => {
    setLocation(value);
    setShowSuggestions(value.length > 0);
  };

  const selectLocation = (selectedLocation) => {
    setLocation(selectedLocation);
    setShowSuggestions(false);
  };

  const toggleAccordion = (familyId) => {
    setOpenAccordion(openAccordion === familyId ? null : familyId);
  };

  const [familyDistributions, setFamilyDistributions] = useState({}); 
  const [loadingDistributions, setLoadingDistributions] = useState({});
  const [errorDistributions, setErrorDistributions] = useState({}); 

  const handleAccordionToggle = async (familyId) => {
    if (openAccordion === familyId) {
      setOpenAccordion(null);
      return;
    }
    setOpenAccordion(familyId);
    if (!familyDistributions[familyId]) {
      setLoadingDistributions((prev) => ({ ...prev, [familyId]: true }));
      setErrorDistributions((prev) => ({ ...prev, [familyId]: null }));
      try {
        const dists = await api.get(`/families/${familyId}/distributions`);
        setFamilyDistributions((prev) => ({ ...prev, [familyId]: dists }));
      } catch (err) {
        setErrorDistributions((prev) => ({
          ...prev,
          [familyId]: err.message || "Failed to load distributions",
        }));
      } finally {
        setLoadingDistributions((prev) => ({ ...prev, [familyId]: false }));
      }
    }
  };

  const handleDeleteFamily = async (id) => {
    if (!window.confirm("Are you sure you want to delete this family?")) return;
    try {
      await api.delete(`/families/${id}`);
      setFamilies((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete family");
    }
  };

  const specialNeedsOptions = [
    "Physical Disability",
    "Chronic Illness",
    "Food Allergy",
    "Baby formula",
    "Pregnancy",
  ];
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [otherNeed, setOtherNeed] = useState("");

  const handleNeedChange = (need) => {
    if (selectedNeeds.includes(need)) {
      setSelectedNeeds(selectedNeeds.filter((n) => n !== need));
    } else {
      setSelectedNeeds([...selectedNeeds, need]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setLocation("");
    setMemberCount(4);
    setEditId(null);
  };

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredFamilies = families.filter(fam => {
    const name = fam.name?.toLowerCase() || "";
    const area = fam.area?.toLowerCase() || "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      area.includes(searchTerm.toLowerCase())
    );
  });
  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage);
  const paginatedFamilies = filteredFamilies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalFamilies = families.length;
  const avgFamilySize = families.length > 0 ? (families.reduce((sum, f) => sum + (f.familySize || 0), 0) / families.length).toFixed(1) : 0;
  const familiesWithNeeds = families.filter(f => Array.isArray(f.specialNeeds) && f.specialNeeds.length > 0).length;

  const houseColors = [
    'bg-purple-50 text-purple-600',
    'bg-blue-50 text-blue-600',
    'bg-green-50 text-green-600',
    'bg-orange-50 text-orange-600',
  ];
  const needsColors = [
    'bg-yellow-100 text-yellow-800',
    'bg-teal-100 text-teal-800',
    'bg-violet-100 text-violet-800',
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Families Management
          </h2>
          <p className="text-gray-600">
            Manage beneficiaries receiving food aid
          </p>
        </div>
        <button
          onClick={handleAddFamily}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center"
        >
          <i className="fas fa-plus-circle mr-2"></i> Add Family
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`${styles.summaryCard} bg-white p-5 shadow-md rounded-xl`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Total Families</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-800">{totalFamilies}</h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <i className="fas fa-users text-xl text-purple-600"></i>
            </div>
          </div>
        </div>
        <div className={`${styles.summaryCard} bg-white p-5 shadow-md rounded-xl`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Average Family Size</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-800">{avgFamilySize}</h3>
              <p className="text-gray-500 text-sm">People per family</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <i className="fas fa-user-group text-xl text-blue-600"></i>
            </div>
          </div>
        </div>
        <div className={`${styles.summaryCard} bg-white p-5 shadow-md rounded-xl`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Families with Special Needs</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-800">{familiesWithNeeds}</h3>
            </div>
            <div className="bg-yellow-50 p-3 rounded-full">
              <i className="fas fa-heart-circle-check text-xl text-yellow-600"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Registered Families
            </h3>
            <div className="flex space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search families..."
                  className="bg-gray-100 border-none rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg">
                <i className="fas fa-filter text-gray-600"></i>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="py-3 px-4 text-left">Family Name</th>
                  <th className="py-3 px-4 text-left">Number of People</th>
                  <th className="py-3 px-4 text-left">Area / Location</th>
                  <th className="py-3 px-4 text-left">Special Needs</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      Loading families...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : families.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No families found
                    </td>
                  </tr>
                ) : (
                  paginatedFamilies.map((fam, famIdx) => (
                    <React.Fragment key={fam._id}>
                      <tr className={`${styles.familyRow} cursor-pointer`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${houseColors[famIdx % houseColors.length]}`}>
                              <i className="fas fa-house-user"></i>
                            </div>
                            <div>
                              <p className="font-medium">{fam.name}</p>
                              <p className="text-gray-500 text-sm">
                                ID: {fam._id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2">
                              {fam.familySize}
                            </span>
                            <span>Members</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <i className="fas fa-location-dot text-gray-400 mr-2"></i>
                            <span>{fam.area}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {Array.isArray(fam.specialNeeds) &&
                          fam.specialNeeds.length > 0 ? (
                            fam.specialNeeds.map((need, idx) => (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-1 rounded-full mr-1 ${needsColors[idx % needsColors.length]}`}
                              >
                                {need}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-3">
                            <button
                              className={`${styles.actionBtn} text-blue-600 hover:text-blue-800`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditFamily(fam);
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className={`${styles.actionBtn} text-red-600 hover:text-red-800`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFamily(fam._id);
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                            <button
                              className={`${styles.actionBtn} text-gray-600 hover:text-gray-800`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccordionToggle(fam._id);
                              }}
                            >
                              <i
                                className={`fas ${
                                  openAccordion === fam._id
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                }`}
                              ></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr
                        className={
                          openAccordion === fam._id ? "" : styles.hiddenRow
                        }
                        onClick={() => handleAccordionToggle(fam._id)}
                      >
                        <td colSpan="5" className="bg-gray-50 p-0">
                          <div
                            className={`${styles.accordionContent}`}
                            style={{
                              maxHeight:
                                openAccordion === fam._id ? "300px" : "0px",
                            }}
                          >
                            <div className="p-4">
                              <h4 className="font-semibold mb-3 text-gray-700">
                                Donation History
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full bg-white rounded-lg">
                                  <thead>
                                    <tr className="text-gray-500 text-sm">
                                      <th className="py-2 px-4 text-left">
                                        Date
                                      </th>
                                      <th className="py-2 px-4 text-left">
                                        Items
                                      </th>
                                      <th className="py-2 px-4 text-left">
                                        Quantity
                                      </th>
                                      <th className="py-2 px-4 text-left">
                                        Distributed By
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {loadingDistributions[fam._id] ? (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="text-center text-gray-400 py-4"
                                        >
                                          Loading...
                                        </td>
                                      </tr>
                                    ) : errorDistributions[fam._id] ? (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="text-center text-red-500 py-4"
                                        >
                                          {errorDistributions[fam._id]}
                                        </td>
                                      </tr>
                                    ) : familyDistributions[fam._id] &&
                                      familyDistributions[fam._id].length >
                                        0 ? (
                                      familyDistributions[fam._id].map(
                                        (dist, idx) => (
                                          <tr key={dist._id || idx}>
                                            <td className="py-3 px-4">
                                              {dist.date
                                                ? new Date(
                                                    dist.date
                                                  ).toLocaleDateString()
                                                : "-"}
                                            </td>
                                            <td className="py-3 px-4">
                                              {dist.material?.name || "-"}
                                            </td>
                                            <td className="py-3 px-4">
                                              {dist.quantity} {dist.unit}
                                            </td>
                                            <td className="py-3 px-4">
                                              {dist.distributedBy?.name ||
                                                dist.distributedBy?.username ||
                                                "-"}
                                            </td>
                                          </tr>
                                        )
                                      )
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="text-center text-gray-400 py-4"
                                        >
                                          No distributions found
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-gray-600 text-sm">
              Showing {(families.length === 0) ? 0 : ((currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, families.length)} of {families.length} families
            </div>
            <div className="flex space-x-2">
              <button
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded-lg ${currentPage === i + 1 ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Family Modal */}
      {isModalOpen && (
        <div
          className={`${styles.modalOverlay} ${
            isModalOpen ? styles.active : ""
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${styles.modalHeader} p-5 pb-4`}>
              <h3 className="text-xl font-semibold text-gray-800">
                Add new family
              </h3>
              <p className="text-gray-500 mt-1">
                Register a new beneficiary family
              </p>
            </div>

            <div className="modal-body p-5 pt-3">
              <form id="familyForm">
                <div className="mb-5">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="familyName"
                  >
                    Family Name
                  </label>
                  <input
                    type="text"
                    id="familyName"
                    className={`${styles.inputField} w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500`}
                    placeholder="Enter family name"
                    required
                  />
                </div>

                <div className="mb-5">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="familyMembers"
                  >
                    Number of Family Members
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      className="bg-gray-200 text-xl w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-300"
                      onClick={() => changeMemberCount(-1)}
                      aria-label="Decrease family members"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="familyMembers"
                      className="w-16 text-center border border-gray-300 rounded-lg py-2 text-lg"
                      min="1"
                      max="20"
                      value={memberCount}
                      readOnly
                    />
                    <button
                      type="button"
                      className="bg-gray-200 text-xl w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-300"
                      onClick={() => changeMemberCount(1)}
                      aria-label="Increase family members"
                    >
                      +
                    </button>
                    <span className="text-gray-500 text-xs ml-2">(1-20)</span>
                  </div>
                </div>

                <div className="mb-5">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="location"
                  >
                    Area / Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    className={`${styles.inputField} w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500`}
                    placeholder="Enter area or location"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="specialNeeds"
                  >
                    Special Needs
                  </label>
                  <div className="flex flex-wrap gap-3 mb-2">
                    {specialNeedsOptions.map((need) => (
                      <label key={need} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedNeeds.includes(need)}
                          onChange={() => handleNeedChange(need)}
                        />
                        <span>{need}</span>
                      </label>
                    ))}
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedNeeds.includes("Others")}
                        onChange={() => handleNeedChange("Others")}
                      />
                      <span>Others</span>
                    </label>
                  </div>
                  {selectedNeeds.includes("Others") && (
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 mt-2"
                      placeholder="Kindly specify..."
                      value={otherNeed}
                      onChange={(e) => setOtherNeed(e.target.value)}
                    />
                  )}
                </div>
              </form>
            </div>

            <div
              className={`${styles.modalFooter} p-5 pt-3 flex justify-end space-x-3`}
            >
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFamily}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Family
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FamiliesPage;
