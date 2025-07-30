import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import styles from "./SettingsPage.module.css";
import api from "../services/api";

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

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switches, setSwitches] = useState({
    automaticAlerts: true,
    aiRecommendations: true,
    donationReminders: false,
    expirationAlerts: true,
  });
  const [materialNeeds, setMaterialNeeds] = useState({});
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    category: "",
    unit: "",
    averageNeed: 0,
    sku: "",
  });
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [errorMaterials, setErrorMaterials] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "volunteer",
  });
  const [editPassword, setEditPassword] = useState({
    password: "",
    confirm: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/settings");
        setSwitches({
          automaticAlerts: res.automaticAlerts,
          aiRecommendations: res.aiRecommendations,
          donationReminders: res.donationReminders,
          expirationAlerts: res.expirationAlerts,
        });
        setMaterialNeeds(res.materialNeeds || {});
      } catch (err) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      setErrorMaterials(null);
      try {
        const res = await api.get("/materials");
        setMaterials(res);
      } catch (err) {
        setErrorMaterials(err.message || "Failed to load materials");
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const res = await api.get("/users");
      setUsers(res);
    } catch (err) {
      setErrorUsers(err.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateSettings = async (newSettings) => {
    setLoading(true);
    setError(null);
    try {
      await api.put("/settings", newSettings);
    } catch (err) {
      setError(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToggle = (key) => {
    const updated = { ...switches, [key]: !switches[key] };
    setSwitches(updated);
    updateSettings({ ...updated, materialNeeds });
  };

  const handleSaveMaterial = (material, value) => {
    const updatedNeeds = { ...materialNeeds, [material]: value };
    setMaterialNeeds(updatedNeeds);
    updateSettings({ ...switches, materialNeeds: updatedNeeds });
  };

  const handleAddNewMaterial = () => {
    setShowAddMaterialModal(true);
  };

  const handleCloseModal = () => {
    setShowAddMaterialModal(false);
    setNewMaterial({
      name: "",
      category: "",
      unit: "",
      averageNeed: 0,
      sku: "",
    });
  };

  const handleSaveNewMaterial = async () => {
    if (!newMaterial.name || !newMaterial.category || !newMaterial.unit) {
      alert("Please fill in all required fields");
      return;
    }
    const sku =
      newMaterial.sku ||
      `FD-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;
    try {
      setLoadingMaterials(true);
      const res = await api.post("/materials", {
        name: newMaterial.name,
        category: newMaterial.category,
        unit: newMaterial.unit,
        averageMonthlyNeed: newMaterial.averageNeed,
        sku,
      });
      setMaterials((prev) => [...prev, res]);
      alert(
        `Material "${newMaterial.name}" added successfully with SKU: ${sku}`
      );
      handleCloseModal();
    } catch (err) {
      alert(err.message || "Failed to add material");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const generateSKU = () => {
    const sku = `FD-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
    setNewMaterial((prev) => ({ ...prev, sku }));
  };

  const handleSaveMaterialNeed = async (matId, value) => {
    setLoadingMaterials(true);
    try {
      await api.put(`/materials/${matId}`, { averageMonthlyNeed: value });
      setMaterials((prev) =>
        prev.map((m) =>
          m._id === matId ? { ...m, averageMonthlyNeed: value } : m
        )
      );
    } catch (err) {
      setErrorMaterials(err.message || "Failed to update material");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleSaveMaterialRow = async (mat) => {
    setLoadingMaterials(true);
    try {
      await api.put(`/materials/${mat._id}`, {
        name: mat.name,
        category: mat.category,
        unit: mat.unit,
        averageMonthlyNeed: mat.averageMonthlyNeed,
      });
      alert("Material updated successfully");
    } catch (err) {
      alert(err.message || "Failed to update material");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?"))
      return;
    setLoadingMaterials(true);
    try {
      await api.delete(`/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
      alert("Material deleted successfully");
    } catch (err) {
      alert(err.message || "Failed to delete material");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill all fields");
      return;
    }
    try {
      setLoadingUsers(true);
      await api.post("/users", newUser);
      setShowAddUserModal(false);
      setNewUser({ name: "", email: "", password: "", role: "volunteer" });
      fetchUsers();
      alert("User added successfully");
    } catch (err) {
      alert(err.message || "Failed to add user");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleEditUser = async (user) => {
    try {
      setLoadingUsers(true);
      await api.put(`/users/${user._id}`, {
        name: user.name,
        role: user.role,
        status: user.status,
      });
      fetchUsers();
      alert("User updated successfully");
    } catch (err) {
      alert(err.message || "Failed to update user");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setLoadingUsers(true);
      await api.delete(`/users/${id}`);
      fetchUsers();
      alert("User deleted successfully");
    } catch (err) {
      alert(err.message || "Failed to delete user");
    } finally {
      setLoadingUsers(false);
    }
  };

  const openEditPasswordModal = (user) => {
    setSelectedUser(user);
    setEditPassword({ password: "", confirm: "" });
    setShowEditPasswordModal(true);
  };

  const handleChangePassword = async () => {
    if (!editPassword.password || editPassword.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (editPassword.password !== editPassword.confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      setLoadingUsers(true);
      await api.put(`/users/${selectedUser._id}/password`, {
        password: editPassword.password,
      });
      setShowEditPasswordModal(false);
      alert("Password updated successfully");
    } catch (err) {
      alert(err.message || "Failed to update password");
    } finally {
      setLoadingUsers(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-lg text-gray-500">
        Loading settings...
      </div>
    );
  }
  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          System Configuration
        </h1>
        <p className="text-gray-600">
          Manage system preferences and user accounts
        </p>
      </div>

      {/* System Preferences Section */}
      <div className={`${styles.settingsCard} p-6 mb-8`}>
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <i className="fas fa-sliders-h text-green-600 text-xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            System Preferences
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">Automatic Alerts</h3>
              <p className="text-sm text-gray-600">
                Enable system to send low-stock alerts automatically
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={switches.automaticAlerts}
                onChange={() => handleSwitchToggle("automaticAlerts")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">AI Recommendations</h3>
              <p className="text-sm text-gray-600">
                Enable smart distribution recommendations
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={switches.aiRecommendations}
                onChange={() => handleSwitchToggle("aiRecommendations")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">Donation Reminders</h3>
              <p className="text-sm text-gray-600">
                Send reminders to frequent donors
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={switches.donationReminders}
                onChange={() => handleSwitchToggle("donationReminders")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">Expiration Alerts</h3>
              <p className="text-sm text-gray-600">
                Notify before food items expire
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={switches.expirationAlerts}
                onChange={() => handleSwitchToggle("expirationAlerts")}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>

      {/* Material Needs Section */}
      <div className={`${styles.settingsCard} p-6 mb-8`}>
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <i className="fas fa-boxes text-blue-600 text-xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Material Needs Configuration
          </h2>
        </div>
        <p className="text-gray-600 mb-4">
          Set average monthly requirements for each material type
        </p>
        {loadingMaterials ? (
          <div className="text-center py-6 text-gray-400">
            Loading materials...
          </div>
        ) : errorMaterials ? (
          <div className="text-center py-6 text-red-600">{errorMaterials}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="py-3 px-4 text-left">Material</th>
                  <th className="py-3 px-4 text-left">Current Average</th>
                  <th className="py-3 px-4 text-left">Unit</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {materials.map((mat) => (
                  <tr
                    key={mat._id}
                    className={`hover:bg-gray-50 ${styles.editableRow}`}
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
                        <div>
                          <p className="font-medium">{mat.name}</p>
                          <p className="text-gray-500 text-sm">
                            SKU: {mat.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        value={mat.averageMonthlyNeed}
                        min="0"
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setMaterials((prev) =>
                            prev.map((m) =>
                              m._id === mat._id
                                ? { ...m, averageMonthlyNeed: value }
                                : m
                            )
                          );
                        }}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={mat.unit}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMaterials((prev) =>
                            prev.map((m) =>
                              m._id === mat._id ? { ...m, unit: value } : m
                            )
                          );
                        }}
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="L">Liters (L)</option>
                        <option value="units">Units</option>
                        <option value="boxes">Boxes</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={mat.category}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMaterials((prev) =>
                            prev.map((m) =>
                              m._id === mat._id ? { ...m, category: value } : m
                            )
                          );
                        }}
                      >
                        <option value="Staple Food">Staple Food</option>
                        <option value="Perishable">Perishable</option>
                        <option value="Special Items">Special Items</option>
                        <option value="Relief Supplies">Relief Supplies</option>
                        <option value="Others">Others</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 flex gap-6">
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleSaveMaterialRow(mat)}
                      >
                        <i className="fas fa-save mr-1"></i>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteMaterial(mat._id)}
                      >
                        <i className="fas fa-trash-alt mr-1"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-gray-50">
                  <td className="py-4 px-4" colSpan={6}>
                    <button
                      onClick={handleAddNewMaterial}
                      className="text-green-600 hover:text-green-800 flex items-center"
                    >
                      <i className="fas fa-plus-circle mr-2"></i> Add New
                      Material
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Management Section */}
      <div className={`${styles.settingsCard} p-6 mb-8`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <i className="fas fa-users text-purple-600 text-xl"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              User Management
            </h2>
          </div>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            onClick={() => setShowAddUserModal(true)}
          >
            <i className="fas fa-user-plus mr-2"></i> Add New User
          </button>
        </div>
        {loadingUsers ? (
          <div className="text-center py-6 text-gray-400">Loading users...</div>
        ) : errorUsers ? (
          <div className="text-center py-6 text-red-600">{errorUsers}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Role</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.name
                          )}&background=5A7D57&color=fff`}
                          alt="User"
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">
                            {user.lastActive
                              ? `Last active: ${new Date(
                                  user.lastActive
                                ).toLocaleString()}`
                              : "Never active"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{user.email}</td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          const value = e.target.value;
                          setUsers((prev) =>
                            prev.map((u) =>
                              u._id === user._id ? { ...u, role: value } : u
                            )
                          );
                        }}
                        className="bg-gray-100 border-none rounded-lg px-3 py-1 focus:outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="volunteer">Volunteer</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.status}
                        onChange={(e) => {
                          const value = e.target.value;
                          setUsers((prev) =>
                            prev.map((u) =>
                              u._id === user._id ? { ...u, status: value } : u
                            )
                          );
                        }}
                        className="bg-gray-100 border-none rounded-lg px-3 py-1 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
           
                    <td className="py-4 px-4 flex gap-3">
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleEditUser(user)}
                        title="Save changes"
                      >
                        <i className="fas fa-save"></i>
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openEditPasswordModal(user)}
                        title="Change password"
                      >
                        <i className="fas fa-key"></i>
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete user"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className={`${styles.settingsCard} p-6`}>
        <div className="flex items-center mb-6">
          <div className="bg-red-100 p-3 rounded-lg mr-4">
            <i className="fas fa-lock text-red-600 text-xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Change Password
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter new password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters
            </p>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Add New Material Modal */}
      {showAddMaterialModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Add New Material
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Name *
                </label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) =>
                    setNewMaterial((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Sugar, Flour, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newMaterial.category}
                  onChange={(e) =>
                    setNewMaterial((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Category</option>
                  <option value="Staple Food">Staple Food</option>
                  <option value="Perishable">Perishable</option>
                  <option value="Special Items">Special Items</option>
                  <option value="Relief Supplies">Relief Supplies</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <select
                  value={newMaterial.unit}
                  onChange={(e) =>
                    setNewMaterial((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Unit</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="L">Liters (L)</option>
                  <option value="units">Units</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average Monthly Need
                </label>
                <input
                  type="number"
                  value={newMaterial.averageNeed}
                  onChange={(e) =>
                    setNewMaterial((prev) => ({
                      ...prev,
                      averageNeed: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Optional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMaterial.sku}
                    onChange={(e) =>
                      setNewMaterial((prev) => ({
                        ...prev,
                        sku: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., FD-001"
                  />
                  <button
                    onClick={generateSKU}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewMaterial}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Add New User
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Email Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="admin">Admin</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {showEditPasswordModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Change Password
              </h3>
              <button
                onClick={() => setShowEditPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={editPassword.password}
                  onChange={(e) =>
                    setEditPassword((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={editPassword.confirm}
                  onChange={(e) =>
                    setEditPassword((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Repeat password"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditPasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SettingsPage;
