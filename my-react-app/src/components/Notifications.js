import React, { useEffect, useState } from "react";
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTrash } from "react-icons/fa";
import "./Notifications.css";
import notificationSound from "../assets/notification.mp3";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [audio] = useState(new Audio(notificationSound));

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      audio.play();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAsDelivered = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/delivered`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isDelivered: true } : n));
      audio.play();
    } catch (error) {
      console.error("Error marking as delivered:", error);
    }
  };

  const clearAll = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        await fetch("http://localhost:5000/api/notifications", { method: "DELETE" });
        setNotifications([]);
      } catch (error) {
        console.error("Error clearing notifications:", error);
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "info": return <FaInfoCircle className="info-icon" />;
      case "success": return <FaCheckCircle className="success-icon" />;
      case "warning": return <FaExclamationTriangle className="warning-icon" />;
      default: return <FaInfoCircle className="info-icon" />;
    }
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Admin Notifications</h2>
        {notifications.length > 0 && (
          <button onClick={clearAll} className="clear-btn">
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n._id} className={`notification ${n.isRead ? "read" : "unread"}`}>
              <div className="icon">{getIcon(n.type)}</div>
              <div className="content">
                <h3>{n.title}</h3>
                <p>{n.message}</p>
                <small>{new Date(n.timestamp).toLocaleString()}</small>
                <p><strong>Customer:</strong> {n.customerName}</p>
                <p><strong>Phone:</strong> {n.phone}</p>
                <p><strong>Email:</strong> {n.email}</p>
                <p><strong>Table:</strong> {n.tableNumber}</p>
                <p><strong>Scheduled For:</strong> {new Date(n.scheduleTime).toLocaleString()}</p>
                <p><strong>Total:</strong> ₹{n.totalAmount}</p>
                {n.items?.length > 0 && (
                  <ul>
                    {n.items.map((item, idx) => (
                      <li key={idx}>{item.name} - ₹{item.price}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="button-group">
                {!n.isRead && (
                  <button onClick={() => markAsRead(n._id)}>Mark as Read</button>
                )}
                {!n.isDelivered && (
                  <button onClick={() => markAsDelivered(n._id)}>Delivered</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
