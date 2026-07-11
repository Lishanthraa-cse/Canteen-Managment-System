import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaClipboardList, FaUtensils, FaBell, FaShieldAlt, FaChartBar,
  FaUsers, FaExclamationTriangle, FaLock, FaDatabase, FaMoon, FaSun, FaBars
} from "react-icons/fa";
import "./AdminDashboard.css";
import notificationSound from "../assets/notification.mp3";

const AdminDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [newNotificationMessage, setNewNotificationMessage] = useState("");
  const [audio] = useState(new Audio(notificationSound));

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const menuItems = [
    { path: "/order", icon: <FaClipboardList />, title: "Order Responses" },
    { path: "/admin", icon: <FaUtensils />, title: "Menu Management" },
    { path: "/notifications", icon: <FaBell />, title: "Notifications" },
    { path: "/securitysettings", icon: <FaShieldAlt />, title: "Security Settings" },
    { path: "/adminlogs", icon: <FaChartBar />, title: "Admin Logs" },
    { path: "/manageroles", icon: <FaUsers />, title: "Manage Roles" },
    { path: "/specials", icon: <FaExclamationTriangle />, title: "Specials" },
    { path: "/feedback", icon: <FaLock />, title: "Feedback" },
    { path: "/backup", icon: <FaDatabase />, title: "Backup & Restore" },
  ];

  const fetchScheduledOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/scheduleorder");
      const data = await res.json();
      if (data.length > notifications.length) {
        audio.play();
        setNewNotificationMessage("📢 New scheduled order received!");
      }
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch scheduled orders", error);
    }
  }, [notifications, audio]);

  useEffect(() => {
    const interval = setInterval(fetchScheduledOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchScheduledOrders]);

  useEffect(() => {
    if (newNotificationMessage) {
      const timeout = setTimeout(() => setNewNotificationMessage(""), 5000);
      return () => clearTimeout(timeout);
    }
  }, [newNotificationMessage]);

  return (
    <div className={`admin-container ${darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <button onClick={toggleSidebar} className="menu-toggle">
            <FaBars />
          </button>
          {sidebarOpen && <h1 className="sidebar-title">Admin Panel</h1>}
        </div>

        {sidebarOpen && (
          <>
            <input
              type="text"
              className="search-bar"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <nav className="sidebar-menu">
              {menuItems.filter((item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((item, index) => (
                <Link key={index} to={item.path} className="sidebar-link">
                  <span className="icon">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
            <button onClick={toggleDarkMode} className="dark-mode-toggle" aria-label="Toggle Dark Mode">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </>
        )}
      </aside>

      <main className="dashboard">
        <header className="dashboard-header">
          <h1>Welcome, Admin</h1>
          <p>Manage your canteen operations efficiently.</p>
        </header>

        <section className="notifications-section">
          <h2 className="section-title">Scheduled Orders</h2>
          {newNotificationMessage && (
            <div className="notification-alert animate-bounce">
              {newNotificationMessage}
            </div>
          )}
          {notifications.length === 0 ? (
            <p>No scheduled orders yet.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((order, idx) => (
                <li key={idx} className="notification-card">
                  <strong>Order #{order.orderId}</strong> <br />
                  Scheduled Time: {new Date(order.scheduledTime).toLocaleTimeString()} <br />
                  Items: {order.items.map((item) => item.name).join(", ")}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="backup-section">
          <h2 className="section-title">Backup & Restore</h2>
          <div className="backup-buttons">
            <button
              className="btn-backup"
              onClick={async () => {
                try {
                  const res = await fetch("http://localhost:5000/api/backup");
                  const data = await res.json();
                  alert(data.message);
                } catch (err) {
                  alert("Backup failed.");
                }
              }}
            >
              🔄 Backup Now
            </button>

            <button
              className="btn-restore"
              onClick={async () => {
                if (!window.confirm("Are you sure you want to restore?")) return;
                try {
                  const res = await fetch("http://localhost:5000/api/restore", { method: "POST" });
                  const data = await res.json();
                  alert(data.message);
                } catch (err) {
                  alert("Restore failed.");
                }
              }}
            >
              ♻️ Restore Backup
            </button>
          </div>
        </section>

        <section className="grid-container">
          {menuItems.slice(0, 3).map((item, index) => (
            <Link key={index} to={item.path} className="dashboard-card">
              <div className="card-icon">{item.icon}</div>
              <div className="card-content">
                <h2>{item.title}</h2>
                <p>Manage {item.title.toLowerCase()} efficiently.</p>
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
