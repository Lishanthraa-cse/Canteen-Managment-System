import React, { useEffect, useState } from "react";
import {
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTrash,
  FaBell,
  FaSync,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import AdminSidebar from "./AdminSidebar";
import "./Notifications.css";

const Notifications = () => {
  const { showToast, isDarkMode } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      showToast("Marked as read", "info");
    } catch (error) {
      console.error(error);
    }
  };

  const markAsDelivered = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/delivered`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isDelivered: true, isRead: true } : n))
      );
      showToast("Order marked as delivered", "success");
    } catch (error) {
      console.error(error);
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    try {
      await fetch("/api/notifications", { method: "DELETE" });
      setNotifications([]);
      showToast("All notifications cleared", "info");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`admin-portal-root ${isDarkMode ? "dark-theme" : ""}`}>
      <AdminSidebar />
      <div className="admin-main-viewport" style={{ padding: 0 }}>
        <div className="notif-mgmt-root">
      <div className="notif-top-nav">
        <h2>🔔 Kitchen Notifications & Alerts</h2>
        <div className="top-actions">
          <button className="sync-btn" onClick={fetchNotifications}>
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
          {notifications.length > 0 && (
            <button className="clear-all-btn" onClick={clearAll}>
              <FaTrash /> Clear All
            </button>
          )}
        </div>
      </div>

      <main className="notif-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Checking incoming alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-notif-box">
            <FaBell className="empty-bell" />
            <h3>All Caught Up!</h3>
            <p>No new order alerts or scheduled notices right now.</p>
          </div>
        ) : (
          <div className="notif-list-wrap">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-card ${n.isRead ? "read" : "unread"}`}
              >
                <div className="notif-icon-col">
                  {n.type === "success" ? (
                    <FaCheckCircle className="icon-success" />
                  ) : n.type === "warning" ? (
                    <FaExclamationTriangle className="icon-warning" />
                  ) : (
                    <FaInfoCircle className="icon-info" />
                  )}
                </div>

                <div className="notif-body-col">
                  <div className="notif-headline">
                    <h4>{n.title}</h4>
                    <span className="notif-time">
                      {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                    </span>
                  </div>
                  <p className="notif-msg">{n.message}</p>

                  {(n.customerName || n.phone) && (
                    <div className="notif-meta-tags">
                      {n.customerName && <span>👤 {n.customerName}</span>}
                      {n.phone && <span>📞 {n.phone}</span>}
                      {n.tableNumber && <span>📍 {n.tableNumber}</span>}
                      {n.scheduleTime && <span>⏰ {n.scheduleTime}</span>}
                      {n.totalAmount > 0 && <span>₹{n.totalAmount}</span>}
                    </div>
                  )}

                  <div className="notif-actions-row">
                    {!n.isRead && (
                      <button className="btn-read" onClick={() => markAsRead(n._id)}>
                        Mark as Read
                      </button>
                    )}
                    {!n.isDelivered && (
                      <button className="btn-delivered" onClick={() => markAsDelivered(n._id)}>
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
