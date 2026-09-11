import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaMoon,
  FaSun,
  FaLeaf,
  FaBell,
  FaArrowLeft,
  FaShieldAlt,
  FaHistory,
  FaHeart,
  FaSignOutAlt,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./Settings.css";

const Settings = () => {
  const { currentUser, logout, isDarkMode, toggleDarkMode, showToast } = useApp();
  const navigate = useNavigate();

  // Local preferences
  const [pureVegOnly, setPureVegOnly] = useState(() => {
    return localStorage.getItem("canteen_pref_veg") === "true";
  });

  const [soundAlerts, setSoundAlerts] = useState(() => {
    return localStorage.getItem("canteen_pref_audio") !== "false";
  });

  const handleToggleVeg = () => {
    const next = !pureVegOnly;
    setPureVegOnly(next);
    localStorage.setItem("canteen_pref_veg", String(next));
    showToast(next ? "Pure Veg mode enabled" : "Showing all menu items", "info");
  };

  const handleToggleSound = () => {
    const next = !soundAlerts;
    setSoundAlerts(next);
    localStorage.setItem("canteen_pref_audio", String(next));
    showToast(next ? "Order sound chimes enabled" : "Order sound chimes muted", "info");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="settings-page-root">
      <Navbar />

      <main className="settings-container">
        <div className="settings-header">
          <Link to="/usershomepage" className="back-link">
            <FaArrowLeft /> Back to Home
          </Link>
          <h1>Account & App Preferences</h1>
          <p>Personalize your SREC campus dining experience and account settings.</p>
        </div>

        <div className="settings-grid">
          {/* User Profile Card */}
          <section className="settings-card profile-card">
            <div className="card-header">
              <FaUser className="header-icon" />
              <h3>Student Profile</h3>
            </div>
            <div className="profile-info-content">
              <div className="profile-avatar-large">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="profile-details">
                <h4>{currentUser?.name || "Student User"}</h4>
                <p className="profile-email">
                  <FaEnvelope /> {currentUser?.email || "student@srec.ac.in"}
                </p>
                <span className="domain-pill">🎓 SREC College Verified</span>
              </div>
            </div>
          </section>

          {/* Preferences Card */}
          <section className="settings-card">
            <div className="card-header">
              <FaShieldAlt className="header-icon" />
              <h3>Application Preferences</h3>
            </div>

            <div className="preferences-list">
              {/* Dark Mode Switch */}
              <div className="pref-row">
                <div className="pref-meta">
                  <div className="pref-icon dark-mode-icon">
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                  </div>
                  <div>
                    <strong>Interface Theme</strong>
                    <p>{isDarkMode ? "Dark Theme Active" : "Light Theme Active"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`toggle-switch-btn ${isDarkMode ? "active" : ""}`}
                  onClick={toggleDarkMode}
                  aria-label="Toggle Dark Mode"
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>

              {/* Pure Veg Preference */}
              <div className="pref-row">
                <div className="pref-meta">
                  <div className="pref-icon veg-icon">
                    <FaLeaf />
                  </div>
                  <div>
                    <strong>Default Pure Veg Filter</strong>
                    <p>Highlight pure vegetarian dishes on today's menu</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`toggle-switch-btn ${pureVegOnly ? "active" : ""}`}
                  onClick={handleToggleVeg}
                  aria-label="Toggle Pure Veg"
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>

              {/* Sound Alerts */}
              <div className="pref-row">
                <div className="pref-meta">
                  <div className="pref-icon bell-icon">
                    <FaBell />
                  </div>
                  <div>
                    <strong>Audio Notification Chimes</strong>
                    <p>Play celebratory chime upon payment and status alerts</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`toggle-switch-btn ${soundAlerts ? "active" : ""}`}
                  onClick={handleToggleSound}
                  aria-label="Toggle Audio Alerts"
                >
                  <span className="toggle-slider"></span>
                </button>
              </div>
            </div>
          </section>

          {/* Quick Actions & Navigation */}
          <section className="settings-card">
            <div className="card-header">
              <FaHistory className="header-icon" />
              <h3>Quick Navigation & Shortcuts</h3>
            </div>

            <div className="shortcuts-grid">
              <Link to="/viewmyorder" className="shortcut-item">
                <FaHistory className="sc-icon" />
                <div>
                  <strong>Order History & Live Token</strong>
                  <span>Track recent kitchen tokens</span>
                </div>
              </Link>

              <Link to="/favorites" className="shortcut-item">
                <FaHeart className="sc-icon heart" />
                <div>
                  <strong>Personal Favorites</strong>
                  <span>Your handpicked dishes</span>
                </div>
              </Link>
            </div>

            <div className="logout-section">
              <button className="logout-action-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Sign Out of Canteen
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;

