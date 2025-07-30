import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    logout,
    notifications = [],
    unreadCount = 0,
    markNotificationRead,
    markAllRead,
    toastNotif,
    consumeToast,
  } = useAppContext();
  const [showNotif, setShowNotif] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (toastNotif) {
      setShowToast(true);
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
      const timer = setTimeout(() => {
        setShowToast(false);
        consumeToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotif]);

  if (!isAuthenticated) {
    return null;
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/donations":
        return "Add New Donation";
      case "/inventory":
        return "Inventory";
      case "/families":
        return "Families";
      case "/smart-distribution":
        return "Smart Distribution";
      case "/reports":
        return "Reports";
      case "/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="relative min-h-screen lg:flex">
      <div
        className={`fixed inset-0 bg-black opacity-50 z-20 lg:hidden ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        className={`fixed inset-y-0 left-0 bg-green-800 text-white w-64 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out z-30 flex flex-col`}
        style={{
          background: "linear-gradient(180deg, #5A7D57 0%, #4a6c46 100%)",
        }}
      >
        <div className="p-5 text-center border-b border-green-700 flex justify-between items-center lg:justify-center">
          <div>
            <h1 className="text-2xl font-bold">FairShare</h1>
            <p className="text-sm text-green-200">Smart Food Donation System</p>
          </div>
          <button
            className="text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <nav className="flex-1 mt-6">
          <ul className="space-y-1">
            <li>
              <Link
                to="/dashboard"
                className={`sidebar-item flex items-center px-6 py-3 ${
                  isActivePage("/dashboard")
                    ? "text-white font-medium"
                    : "text-green-100 hover:text-white"
                }`}
              >
                <i className="fas fa-chart-pie mr-3"></i>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/donations"
                className={`sidebar-item flex items-center px-6 py-3 ${
                  isActivePage("/donations")
                    ? "text-white font-medium"
                    : "text-green-100 hover:text-white"
                }`}
              >
                <i className="fas fa-hand-holding-heart mr-3"></i>
                Donations
              </Link>
            </li>
            <li>
              <Link
                to="/inventory"
                className={`sidebar-item flex items-center px-6 py-3 ${
                  isActivePage("/inventory")
                    ? "text-white font-medium"
                    : "text-green-100 hover:text-white"
                }`}
              >
                <i className="fas fa-warehouse mr-3"></i>
                Inventory
              </Link>
            </li>
            <li>
              <Link
                to="/families"
                className={`sidebar-item flex items-center px-6 py-3 ${
                  isActivePage("/families")
                    ? "text-white font-medium"
                    : "text-green-100 hover:text-white"
                }`}
              >
                <i className="fas fa-users mr-3"></i>
                Families
              </Link>
            </li>
            <li>
              <Link
                to="/smart-distribution"
                className={`sidebar-item flex items-center px-6 py-3 ${
                  isActivePage("/smart-distribution")
                    ? "text-white font-medium"
                    : "text-green-100 hover:text-white"
                }`}
              >
                <i className="fas fa-brain mr-3"></i>
                Smart Distribution
              </Link>
            </li>
            <li>
              <Link
                to="/reports"
                className={`sidebar-item flex items-center px-6 py-3 ${
                  isActivePage("/reports")
                    ? "text-white font-medium"
                    : "text-green-100 hover:text-white"
                }`}
              >
                <i className="fas fa-chart-bar mr-3"></i>
                Reports
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`sidebar-item flex items-center px-6 py-3 ${
                  isActivePage("/settings")
                    ? "text-white font-medium"
                    : "text-green-100 hover:text-white"
                }`}
              >
                <i className="fas fa-cog mr-3"></i>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 text-center text-xs text-green-200 border-t border-green-700">
          © 2023 SAMI. All rights reserved
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div className="flex items-center">
            <button
              className="text-gray-500 focus:outline-none lg:hidden mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="fas fa-bars fa-lg"></i>
            </button>
            <div className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative">
              <button
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                onClick={() => setShowNotif(!showNotif)}
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-40 max-h-96 overflow-y-auto notification-list"
                  style={{ scrollbarWidth: "thin" }}
                >
                  <div className="flex justify-between items-center px-4 py-2 border-b">
                    <span className="font-medium">Notifications</span>
                    <button
                      className="text-sm text-green-600"
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`px-4 py-3 flex items-start ${
                          !n.read ? "bg-gray-50" : ""
                        }`}
                      >
                        <i
                          className={`fas fa-${
                            n.type === "shortage"
                              ? "exclamation-circle text-red-600"
                              : n.type === "surplus"
                              ? "arrow-up text-blue-600"
                              : "info-circle text-green-600"
                          } mr-2 mt-1`}
                        ></i>
                        <div className="flex-1 text-sm">
                          <p className="text-gray-800">{n.message}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.read && (
                          <button
                            className="text-xs text-green-600"
                            onClick={() => markNotificationRead(n._id)}
                          >
                            Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${
                  user?.name || "User"
                }&background=5A7D57&color=fff`}
                alt="User"
                className="w-10 h-10 rounded-full mr-2 sm:mr-4"
              />
              <div className="hidden sm:block text-sm">
                <p className="font-semibold">{user?.name || "Guest User"}</p>
                <p className="text-gray-500 text-xs">
                  {user?.role === "admin"
                    ? "Admin"
                    : user?.role === "volunteer"
                    ? "Volunteer"
                    : ""}
                </p>
              </div>
              <button
                onClick={logout}
                className="ml-2 sm:ml-4 text-gray-500 hover:text-red-600"
                title="Logout"
              >
                <i className="fas fa-sign-out-alt fa-lg"></i>
              </button>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        {showToast && toastNotif && (
          <div
            className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-start animate-slideIn z-50"
            style={{ borderLeft: "4px solid #10b981" }}
          >
            <i
              className={`fas fa-${
                toastNotif.type === "shortage"
                  ? "exclamation-circle text-red-600"
                  : toastNotif.type === "surplus"
                  ? "arrow-up text-blue-600"
                  : "info-circle text-green-600"
              } mr-3 mt-1`}
            ></i>
            <div>
              <p className="text-gray-800 text-sm font-medium">
                {toastNotif.message}
              </p>
              <p className="text-gray-400 text-xs">
                {new Date(toastNotif.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
