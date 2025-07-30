import React, { createContext, useState, useContext, useEffect } from "react";
import { getSocket } from "../services/socket";
import api from "../services/api";

const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    notifications: [],
    unreadCount: 0,
  });
  const [toastNotif, setToastNotif] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState((prev) => ({ ...prev, isAuthenticated: true, user }));
        initNotifications(token);
      } catch {
        setState((prev) => ({ ...prev, isAuthenticated: true, user: null }));
      }
    }
  }, []);

  const initNotifications = async (token) => {
    try {
      const notificationsRes = await api.get("/notifications");
      const user = JSON.parse(localStorage.getItem("user"));
      const filtered = notificationsRes.filter(
        (n) => !n.user || n.user === user._id
      );
      setState((prev) => ({
        ...prev,
        notifications: filtered,
        unreadCount: filtered.filter((n) => !n.read).length,
      }));
    } catch {
    }
    const socket = getSocket(token);
    socket.on("notification", (notif) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!notif.user || notif.user === user._id) {
        setState((prev) => {
          if (prev.notifications.some((n) => n._id === notif._id)) return prev;
          return {
            ...prev,
            notifications: [notif, ...prev.notifications],
            unreadCount: prev.unreadCount + 1,
          };
        });
        setToastNotif(notif);
      }
    });
  };

  const markNotificationRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch {}
  };

  const markAllRead = () => {
    state.notifications.forEach((n) => {
      if (!n.read) markNotificationRead(n._id);
    });
  };

  const login = (userData) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: userData,
    }));
    localStorage.setItem("user", JSON.stringify(userData));
    const token = localStorage.getItem("token");
    if (token) initNotifications(token);
  };

  const logout = () => {
    if (state.socket) state.socket.disconnect();
    setState({
      isAuthenticated: false,
      user: null,
      notifications: [],
      unreadCount: 0,
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const contextValue = {
    ...state,
    login,
    logout,
    markNotificationRead,
    markAllRead,
    toastNotif,
    consumeToast: () => setToastNotif(null),
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
