import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaClipboardList,
  FaUtensils,
  FaBell,
  FaExclamationTriangle,
  FaLock,
  FaShieldAlt,
  FaBars,
  FaSun,
  FaMoon,
  FaSignOutAlt,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import campusLogo from "../assets/campuseats-logo.png";

const AdminSidebar = () => {
  const { logoutAdmin, isDarkMode, toggleDarkMode } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("canteen_admin_sidebar") !== "collapsed";
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("canteen_admin_sidebar", next ? "open" : "collapsed");
      return next;
    });
  };

  const menuItems = [
    { path: "/admindashboard", icon: <FaChartBar />, title: "Overview Dashboard" },
    { path: "/order", icon: <FaClipboardList />, title: "Live Orders Kanban" },
    { path: "/admin", icon: <FaUtensils />, title: "Menu Management" },
    { path: "/notifications", icon: <FaBell />, title: "Notifications" },
    { path: "/specials", icon: <FaExclamationTriangle />, title: "Daily Specials" },
    { path: "/feedback", icon: <FaLock />, title: "Student Reviews" },
    { path: "/adminlogs", icon: <FaClipboardList />, title: "Activity Logs" },
    { path: "/securitysettings", icon: <FaShieldAlt />, title: "Security Settings" },
  ];

  return (
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
      <div className="admin-brand-header">
        <div className="brand-logo-cluster">
          <img
            src={campusLogo}
            alt="CampusEats Logo"
            className={`sidebar-brand-img ${sidebarOpen ? "" : "collapsed"}`}
          />
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={handleToggle}
          aria-label="Toggle sidebar"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <FaBars />
        </button>
      </div>

      <nav className="sidebar-nav-list">
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`sidebar-nav-link ${location.pathname === item.path ? "active" : ""}`}
            title={!sidebarOpen ? item.title : ""}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {sidebarOpen && <span className="sidebar-text">{item.title}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer-box">
        <button
          className="theme-toggle-btn"
          onClick={toggleDarkMode}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
          {sidebarOpen && <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        <button
          className="admin-logout-btn"
          onClick={() => {
            logoutAdmin();
            navigate("/adminlogin");
          }}
          title="Sign out of admin"
        >
          <FaSignOutAlt />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

