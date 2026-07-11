import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaMoon, FaSun, FaClipboardList, FaUtensils, FaBell, FaShieldAlt, FaChartBar, FaUsers, FaExclamationTriangle, FaLock, FaDatabase } from "react-icons/fa";
import "./AdminHome.css";

const AdminHome = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ users: 0, orders: 0, messages: 0 });

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    setTimeout(() => {
      setStats({ users: 1245, orders: 36, messages: 12 });
    }, 1000);
  }, []);

  const menuItems = [
    { path: "/order", icon: <FaClipboardList />, title: "Order Responses" },
    { path: "/admin", icon: <FaUtensils />, title: "Menu Management" },
    { path: "/notifications", icon: <FaBell />, title: "Notifications" },
    { path: "/security-settings", icon: <FaShieldAlt />, title: "Security Settings" },
    { path: "/access-logs", icon: <FaChartBar />, title: "Admin Logs" },
    { path: "/user-roles", icon: <FaUsers />, title: "Manage Roles" },
    { path: "/fraud-detection", icon: <FaExclamationTriangle />, title: "Fraud Detection" },
    { path: "/emergency-shutdown", icon: <FaLock />, title: "Emergency Mode" },
    { path: "/backup", icon: <FaDatabase />, title: "Backup & Restore" },
  ];

  return (
    <div className={`admin-container ${darkMode ? "dark-mode" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Admin Panel</h1>
          <button onClick={toggleSidebar} className="menu-toggle">
            <FaBars />
          </button>
        </div>
        <input
          type="text"
          className="search-bar"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <nav className="sidebar-menu">
          {menuItems
            .filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item, index) => (
              <Link key={index} to={item.path} className="sidebar-link">
                <span className="icon">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}
        </nav>
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </aside>

      <main className="dashboard">
        <header className="dashboard-header">
          <h1>Welcome, Admin</h1>
          <p>Manage your canteen operations efficiently.</p>
        </header>
        <div className="stats-container">
          {[
            { label: "Active Users", value: stats.users },
            { label: "Pending Orders", value: stats.orders },
            { label: "Unread Messages", value: stats.messages },
          ].map((stat, index) => (
            <div key={index} className="stat-box">
              <h2>{stat.label}</h2>
              <p>{stat.value}</p>
            </div>
          ))}
        </div>
        <section className="grid-container">
          {menuItems.map((item, index) => (
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

export default AdminHome;