import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./DonationsPage.module.css";
import api from "../services/api";

const DonationsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    material: "",
    quantity: "",
    datetime: "",
    donor: "",
  });
  const [formUnit, setFormUnit] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [summary, setSummary] = useState({
    today: 0,
    week: 0,
    topDonor: { name: "-", total: 0 },
    mostDonated: { name: "-", total: 0, unit: "" },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    material: "",
    quantity: "",
    date: "",
    time: "",
    donor: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(null);

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday as start
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 29);
    return { today, weekStart, monthAgo };
  };

  const computeSummary = (allDonations) => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1); 
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - todayStart.getDay());
    const monthAgo = new Date(todayStart);
    monthAgo.setDate(todayStart.getDate() - 29);
    let todayCount = 0;
    let weekCount = 0;
    const donorMap = {};
    const matMap = {};
    allDonations.forEach((d) => {
      const dDate = d.date ? new Date(d.date) : null;
      if (!dDate || isNaN(dDate)) return;
      if (dDate >= todayStart && dDate < todayEnd) todayCount += 1;
      if (dDate >= weekStart && dDate < todayEnd) weekCount += 1;
      if (dDate >= monthAgo && dDate < todayEnd) {
        const name = d.donor || "Anonymous";
        donorMap[name] = (donorMap[name] || 0) + Number(d.quantity);
        const key = d.material?._id || d.material;
        if (key) {
          if (!matMap[key])
            matMap[key] = {
              name: d.material?.name || "-",
              total: 0,
              unit: d.unit,
            };
          matMap[key].total += Number(d.quantity);
        }
      }
    });
    let topDonor = { name: "-", total: 0 };
    Object.entries(donorMap).forEach(([name, total]) => {
      if (total > topDonor.total) topDonor = { name, total };
    });
    let mostDonated = { name: "-", total: 0, unit: "" };
    Object.values(matMap).forEach((m) => {
      if (m.total > mostDonated.total) mostDonated = m;
    });
    return {
      today: todayCount,
      week: weekCount,
      topDonor,
      mostDonated,
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [materialsRes, donationsRes] = await Promise.all([
        api.get("/materials"),
        api.get("/donations"),
      ]);
      setMaterials(materialsRes);
      setDonations(donationsRes);
      setSummary(computeSummary(donationsRes));
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setForm((f) => ({
      ...f,
      datetime: new Date().toISOString().slice(0, 16),
    }));
  }, []);

  useEffect(() => {
    const mat = materials.find((m) => m._id === form.material);
    setFormUnit(mat ? mat.unit : "");
  }, [form.material, materials]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "material") {
      setForm((prev) => ({ ...prev, quantity: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.material || !form.quantity || !form.datetime) {
      setError("Please fill in all required fields.");
      return;
    }
    setFormLoading(true);
    try {
      await api.post("/donations", {
        material: form.material,
        quantity: Number(form.quantity),
        date: form.datetime,
        donor: form.donor,
      });
      setSuccess("Donation added successfully.");
      setForm({
        material: "",
        quantity: "",
        datetime: "",
        donor: "",
      });
      setFormUnit("");
      fetchData();
    } catch (err) {
      setError(err.message || "Failed to add donation");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (don) => {
    setEditId(don._id);
    let date = "",
      time = "";
    if (don.date) {
      const d = new Date(don.date);
      if (!isNaN(d)) {
        date = d.toISOString().split("T")[0];
        time = d.toTimeString().slice(0, 5);
      }
    }
    setEditForm({
      material: don.material?._id || don.material,
      quantity: don.quantity,
      date,
      time,
      donor: don.donor || "",
    });
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSave = async (id) => {
    try {
      let dateTime = editForm.date;
      if (editForm.date) {
        if (editForm.time) {
          dateTime = editForm.date + "T" + editForm.time + ":00";
        } else {
          dateTime = editForm.date + "T12:00:00";
        }
      }
      await api.put(`/donations/${id}`, {
        material: editForm.material,
        quantity: Number(editForm.quantity),
        date: dateTime,
        donor: editForm.donor,
      });
      setEditId(null);
      fetchData();
      setSuccess("Donation updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update donation");
    }
  };
  const handleEditCancel = () => {
    setEditId(null);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?"))
      return;
    setDeleteLoading(id);
    try {
      await api.delete(`/donations/${id}`);
      fetchData();
      setSuccess("Donation deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete donation");
    } finally {
      setDeleteLoading(null);
    }
  };

  const sortedDonations = [...donations].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA; 
  });
  const totalPages = Math.ceil(sortedDonations.length / itemsPerPage);
  const paginatedDonations = sortedDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96 text-xl text-gray-500">
          Loading donations...
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Today's Donations</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {summary.today}
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <i className="fas fa-gift text-2xl text-green-600"></i>
            </div>
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            Number of donations made today
          </div>
        </div>
        {/* Card 2 */}
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">This Week</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-800">
                {summary.week}
              </h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <i className="fas fa-calendar-week text-2xl text-blue-600"></i>
            </div>
          </div>
          <div className="mt-4 text-gray-400 text-sm">
            Total donations this week
          </div>
        </div>
        {/* Card 3 */}
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Top Donor</p>
              <h3 className="text-xl font-bold mt-2 text-gray-800">
                {summary.topDonor.name}
              </h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <i className="fas fa-crown text-2xl text-purple-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-700 flex items-center">
              {summary.topDonor.total} items
            </span>
            <p className="text-gray-500 text-sm mt-1">Last 30 days</p>
          </div>
        </div>
        {/* Card 4 */}
        <div className={`${styles.summaryCard} bg-white p-6 shadow-md`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Most Donated</p>
              <h3 className="text-xl font-bold mt-2 text-gray-800">
                {summary.mostDonated.name}
              </h3>
            </div>
            <div className="bg-yellow-50 p-3 rounded-full">
              <i className="fas fa-wheat-awn text-2xl text-yellow-600"></i>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-gray-700 flex items-center">
              {summary.mostDonated.total} {summary.mostDonated.unit}
            </span>
            <p className="text-gray-500 text-sm mt-1">Last 30 days</p>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New Donation</h2>
        <p className="text-gray-600">
          Fill in the form to add a new donation to the system
        </p>
      </div>
      {error && <div className="mb-4 text-red-600 font-medium">{error}</div>}
      {success && (
        <div className="mb-4 text-green-600 font-medium">{success}</div>
      )}
      {/* Form Card */}
      <div className={`${styles.formCard} bg-white p-6 mb-8`}>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Material Name */}
          <div>
            <label
              className="block text-gray-700 text-sm font-medium mb-2"
              htmlFor="material"
            >
              <i className="fas fa-wheat-awn"></i> Material Name{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="material"
                name="material"
                value={form.material}
                onChange={handleFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500"
                required
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
          </div>
          {/* Quantity */}
          <div>
            <label
              className="block text-gray-700 text-sm font-medium mb-2"
              htmlFor="quantity"
            >
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={form.quantity}
                onChange={handleFormChange}
                className={`${styles.quantityInput} w-3/4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500`}
                placeholder="Enter quantity"
                min="1"
                required
              />
              {formUnit && (
                <span className="ml-3 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200 text-gray-700 font-medium">
                  {formUnit}
                </span>
              )}
            </div>
          </div>
          {/* Donation Date & Time */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label
                className="block text-gray-700 text-sm font-medium mb-2"
                htmlFor="datetime"
              >
                <i className="fas fa-calendar"></i> Date of Donation{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="datetime"
                  name="datetime"
                  value={form.datetime}
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500"
                  required
                />
              </div>
            </div>
          </div>
          {/* Donor Name */}
          <div>
            <label
              className="block text-gray-700 text-sm font-medium mb-2"
              htmlFor="donor"
            >
              Donor Name (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="donor"
                name="donor"
                value={form.donor}
                onChange={handleFormChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500"
                placeholder="Enter donor name"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-user"></i>
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className={`${styles.btnPrimary} w-full py-3 px-4 text-white font-medium rounded-lg flex items-center justify-center`}
              disabled={formLoading}
            >
              {formLoading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-save mr-2"></i>
              )}
              {formLoading ? "Saving..." : "Save Donation"}
            </button>
          </div>
        </form>
      </div>
      {/* Recent Donations Table */}
      <div className={`${styles.recentDonations} bg-white p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Recent Donations
          </h3>
          <div className="flex space-x-2">
            <button
              className="p-2 text-gray-500 hover:text-green-600"
              onClick={fetchData}
              title="Refresh"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-medium text-gray-700">
                  Material
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-700">
                  Quantity
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-700">
                  Donor
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-700">
                  Date & Time
                </th>
                <th className="py-3 px-4 text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedDonations.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-6">
                    No donations found
                  </td>
                </tr>
              )}
              {paginatedDonations.map((don) => (
                <tr key={don._id} className="hover:bg-gray-50">
                  {editId === don._id ? (
                    <>
                      <td className="py-4 px-4">
                        <select
                          name="material"
                          value={editForm.material}
                          onChange={handleEditFormChange}
                          className="p-2 border rounded"
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
                      </td>
                      <td className="py-4 px-4">
                        <input
                          type="number"
                          name="quantity"
                          value={editForm.quantity}
                          onChange={handleEditFormChange}
                          className="p-2 border rounded w-20"
                          min="1"
                        />
                        <span className="ml-2">{don.unit}</span>
                      </td>
                      <td className="py-4 px-4">
                        <input
                          type="text"
                          name="donor"
                          value={editForm.donor}
                          onChange={handleEditFormChange}
                          className="p-2 border rounded"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <input
                          type="date"
                          name="date"
                          value={editForm.date}
                          onChange={handleEditFormChange}
                          className="p-2 border rounded"
                        />
                        <input
                          type="time"
                          name="time"
                          value={editForm.time}
                          onChange={handleEditFormChange}
                          className="p-2 border rounded ml-2"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <button
                          className="text-green-600 font-bold mr-2"
                          onClick={() => handleEditSave(don._id)}
                          title="Save"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="text-gray-500 font-bold"
                          onClick={handleEditCancel}
                          title="Cancel"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div
                            className="p-3 rounded-lg mr-3"
                            style={{
                              background:
                                categoryBgColors[don.material?.category] ||
                                "#F3F4F6",
                            }}
                          >
                            {categoryIcons[don.material?.category] || (
                              <i className="fas fa-box"></i>
                            )}
                          </div>
                          <span className="font-medium">
                            {don.material?.name || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {don.quantity} {don.unit}
                      </td>
                      <td className="py-4 px-4">{don.donor || "Anonymous"}</td>
                      <td className="py-4 px-4 text-gray-600">
                        {(() => {
                          if (!don.date) return "-";
                          const d = new Date(don.date);
                          if (isNaN(d)) return "-";
                          const dateStr = d.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          });
                          const timeStr = d.toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                          return `${dateStr} - ${timeStr}`;
                        })()}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          className="text-blue-600 font-bold mr-2"
                          onClick={() => handleEdit(don)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="text-red-600 font-bold"
                          onClick={() => handleDelete(don._id)}
                          title="Delete"
                          disabled={deleteLoading === don._id}
                        >
                          {deleteLoading === don._id ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-trash"></i>
                          )}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
          <div className="text-sm text-gray-700">
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, donations.length)}
            </span>{" "}
            of <span className="font-medium">{donations.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DonationsPage;
