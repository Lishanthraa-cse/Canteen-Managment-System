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
  FaCheckCircle,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaPhone,
  FaGraduationCap,
  FaPalette,
  FaUtensils,
  FaCheck,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./Settings.css";

const Settings = () => {
  const { currentUser, setCurrentUser, logout, isDarkMode, toggleDarkMode, showToast } = useApp();
  const navigate = useNavigate();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("appearance"); // "appearance", "profile", "dining", "notifications", "security"

  // Profile fields
  const [name, setName] = useState(currentUser?.name || "Student User");
  const [phone, setPhone] = useState(currentUser?.phone || "9876543210");
  const [department, setDepartment] = useState(() => localStorage.getItem("canteen_pref_dept") || "CSE");
  const [rollNo, setRollNo] = useState(() => localStorage.getItem("canteen_pref_roll") || "71812105001");

  // Dietary Preferences
  const [pureVegOnly, setPureVegOnly] = useState(() => {
    return localStorage.getItem("canteen_pref_veg") === "true";
  });
  const [spiceLevel, setSpiceLevel] = useState(() => {
    return localStorage.getItem("canteen_pref_spice") || "medium";
  });
  const [ecoCutlery, setEcoCutlery] = useState(() => {
    return localStorage.getItem("canteen_pref_cutlery") !== "false";
  });

  // Notification Preferences
  const [soundAlerts, setSoundAlerts] = useState(() => {
    return localStorage.getItem("canteen_pref_audio") !== "false";
  });
  const [smsAlerts, setSmsAlerts] = useState(() => {
    return localStorage.getItem("canteen_pref_sms") === "true";
  });
  const [specialsAlerts, setSpecialsAlerts] = useState(() => {
    return localStorage.getItem("canteen_pref_specials") !== "false";
  });

  // Security password fields
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Profile Save
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = { ...currentUser, name, phone };
    if (setCurrentUser) setCurrentUser(updatedUser);
    localStorage.setItem("canteen_user", JSON.stringify(updatedUser));
    localStorage.setItem("canteen_pref_dept", department);
    localStorage.setItem("canteen_pref_roll", rollNo);
    showToast("Profile details updated successfully!", "success");
  };

  // Dietary Save
  const handleToggleVeg = () => {
    const next = !pureVegOnly;
    setPureVegOnly(next);
    localStorage.setItem("canteen_pref_veg", String(next));
    showToast(next ? "Pure Veg mode enabled" : "Showing all menu items", "info");
  };

  const handleSpiceChange = (lvl) => {
    setSpiceLevel(lvl);
    localStorage.setItem("canteen_pref_spice", lvl);
    showToast(`Spice preference set to: ${lvl}`, "info");
  };

  const handleToggleCutlery = () => {
    const next = !ecoCutlery;
    setEcoCutlery(next);
    localStorage.setItem("canteen_pref_cutlery", String(next));
    showToast(next ? "Eco-friendly cutlery requested" : "Cutlery opted out", "info");
  };

  // Audio Toggle
  const handleToggleSound = () => {
    const next = !soundAlerts;
    setSoundAlerts(next);
    localStorage.setItem("canteen_pref_audio", String(next));
    showToast(next ? "Order sound chimes enabled" : "Order sound chimes muted", "info");
  };

  // SMS Toggle
  const handleToggleSms = () => {
    const next = !smsAlerts;
    setSmsAlerts(next);
    localStorage.setItem("canteen_pref_sms", String(next));
    showToast(next ? "SMS readiness alerts enabled" : "SMS alerts disabled", "info");
  };

  // Specials Notification Toggle
  const handleToggleSpecials = () => {
    const next = !specialsAlerts;
    setSpecialsAlerts(next);
    localStorage.setItem("canteen_pref_specials", String(next));
    showToast(next ? "Daily specials alerts enabled" : "Daily specials alerts muted", "info");
  };

  // Password Update
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) {
      showToast("New password must be at least 6 characters", "warning");
      return;
    }
    if (newPass !== confirmPass) {
      showToast("New passwords do not match", "warning");
      return;
    }
    setCurrPass("");
    setNewPass("");
    setConfirmPass("");
    showToast("Password updated securely!", "success");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`settings-page-root ${isDarkMode ? "dark-theme" : ""}`}>
      <Navbar />

      <main className="settings-container">
        {/* Top Header Banner */}
        <div className="settings-header-banner">
          <Link to="/usershomepage" className="back-link">
            <FaArrowLeft /> Back to Home
          </Link>
          <div className="header-info-row">
            <div className="header-text-group">
              <h1>Settings & Preferences</h1>
              <p>Manage your campus dining profile, appearance theme, and notifications.</p>
            </div>
            <div className="verified-badge-wrap">
              <span className="user-verified-badge">
                <FaCheckCircle className="badge-icon" /> SREC Verified Account
              </span>
            </div>
          </div>
        </div>

        {/* Settings Layout with Modern Tabs Navigation */}
        <div className="settings-main-layout">
          {/* Navigation Sidebar Tabs */}
          <aside className="settings-tabs-nav">
            <button
              className={`tab-nav-btn ${activeTab === "appearance" ? "active" : ""}`}
              onClick={() => setActiveTab("appearance")}
            >
              <FaPalette className="tab-icon" />
              <span>Appearance & Theme</span>
            </button>

            <button
              className={`tab-nav-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser className="tab-icon" />
              <span>Profile Information</span>
            </button>

            <button
              className={`tab-nav-btn ${activeTab === "dining" ? "active" : ""}`}
              onClick={() => setActiveTab("dining")}
            >
              <FaUtensils className="tab-icon" />
              <span>Dining Preferences</span>
            </button>

            <button
              className={`tab-nav-btn ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <FaBell className="tab-icon" />
              <span>Notifications & Audio</span>
            </button>

            <button
              className={`tab-nav-btn ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <FaShieldAlt className="tab-icon" />
              <span>Security & Password</span>
            </button>

            <div className="nav-shortcuts-box">
              <span className="shortcuts-label">Quick Links</span>
              <Link to="/viewmyorder" className="nav-shortcut-link">
                <FaHistory /> Order History
              </Link>
              <Link to="/favorites" className="nav-shortcut-link">
                <FaHeart /> Saved Favorites
              </Link>
            </div>
          </aside>

          {/* Tab Content Display Area */}
          <section className="settings-content-card">
            {/* 1. APPEARANCE & THEME TAB */}
            {activeTab === "appearance" && (
              <div className="settings-tab-pane">
                <div className="pane-header">
                  <h2>Interface Appearance</h2>
                  <p>Choose your preferred interface theme. Designed for optimal contrast and readability.</p>
                </div>

                <div className="theme-selector-grid">
                  {/* Light Theme Card */}
                  <div
                    className={`theme-visual-card light-preview-card ${!isDarkMode ? "selected" : ""}`}
                    onClick={() => isDarkMode && toggleDarkMode()}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="theme-mockup light-mockup">
                      <div className="mockup-header-bar">
                        <span className="mockup-dot"></span>
                        <span className="mockup-dot"></span>
                        <span className="mockup-dot"></span>
                        <div className="mockup-nav-strip"></div>
                      </div>
                      <div className="mockup-body-area">
                        <div className="mockup-hero-box"></div>
                        <div className="mockup-card-row">
                          <div className="mockup-small-card"></div>
                          <div className="mockup-small-card"></div>
                        </div>
                      </div>
                    </div>
                    <div className="theme-card-info">
                      <div className="theme-title-row">
                        <span className="theme-name">
                          <FaSun className="theme-icon sun" /> Light Theme
                        </span>
                        {!isDarkMode && <span className="active-pill"><FaCheck /> Active</span>}
                      </div>
                      <p className="theme-desc">Crisp white canvas with warm amber accents, ideal for daylight hours.</p>
                    </div>
                  </div>

                  {/* Dark Theme Card */}
                  <div
                    className={`theme-visual-card dark-preview-card ${isDarkMode ? "selected" : ""}`}
                    onClick={() => !isDarkMode && toggleDarkMode()}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="theme-mockup dark-mockup">
                      <div className="mockup-header-bar dark">
                        <span className="mockup-dot"></span>
                        <span className="mockup-dot"></span>
                        <span className="mockup-dot"></span>
                        <div className="mockup-nav-strip dark"></div>
                      </div>
                      <div className="mockup-body-area dark">
                        <div className="mockup-hero-box dark"></div>
                        <div className="mockup-card-row">
                          <div className="mockup-small-card dark"></div>
                          <div className="mockup-small-card dark"></div>
                        </div>
                      </div>
                    </div>
                    <div className="theme-card-info">
                      <div className="theme-title-row">
                        <span className="theme-name">
                          <FaMoon className="theme-icon moon" /> Dark Theme
                        </span>
                        {isDarkMode && <span className="active-pill"><FaCheck /> Active</span>}
                      </div>
                      <p className="theme-desc">Deep slate palette with luminous highlights, crafted for evening study and OLED screens.</p>
                    </div>
                  </div>
                </div>

                <div className="theme-tip-banner">
                  <span className="tip-badge">Pro Tip</span>
                  <p>You can also toggle between themes anytime using the Sun/Moon icon in the top navigation bar!</p>
                </div>
              </div>
            )}

            {/* 2. PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="settings-tab-pane">
                <div className="pane-header">
                  <h2>Student Profile</h2>
                  <p>Update your institutional details to personalize your cafeteria order receipts.</p>
                </div>

                {/* Profile Hero Overview */}
                <div className="profile-hero-card">
                  <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-circle">
                      {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "S"}
                    </div>
                  </div>
                  <div className="profile-hero-meta">
                    <h3>{name || "Student User"}</h3>
                    <p className="hero-email">
                      <FaEnvelope /> {currentUser?.email || "student@srec.ac.in"}
                    </p>
                    <span className="institution-pill">
                      <FaGraduationCap /> Sri Ramakrishna Engineering College
                    </span>
                  </div>
                </div>

                {/* Profile Form */}
                <form className="settings-form-grid" onSubmit={handleSaveProfile}>
                  <div className="form-field-group">
                    <label>Full Name</label>
                    <div className="input-icon-field">
                      <FaUser className="field-icon" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>Phone Number (for pickup SMS)</label>
                    <div className="input-icon-field">
                      <FaPhone className="field-icon" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>Department / Program</label>
                    <div className="input-icon-field">
                      <FaGraduationCap className="field-icon" />
                      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="CSE">Computer Science & Engineering (CSE)</option>
                        <option value="IT">Information Technology (IT)</option>
                        <option value="AI-DS">Artificial Intelligence & Data Science (AI-DS)</option>
                        <option value="ECE">Electronics & Communication (ECE)</option>
                        <option value="EEE">Electrical & Electronics (EEE)</option>
                        <option value="MECH">Mechanical Engineering (MECH)</option>
                        <option value="BME">Biomedical Engineering (BME)</option>
                        <option value="MBA">Management Studies (MBA)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>Student Register / Roll Number</label>
                    <div className="input-icon-field">
                      <FaShieldAlt className="field-icon" />
                      <input
                        type="text"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        placeholder="e.g. 71812105001"
                      />
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" className="save-settings-btn">
                      <FaSave /> Save Profile Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. DINING & FOOD PREFERENCES TAB */}
            {activeTab === "dining" && (
              <div className="settings-tab-pane">
                <div className="pane-header">
                  <h2>Dining & Food Preferences</h2>
                  <p>Customize your everyday menu filtering and cafeteria packing defaults.</p>
                </div>

                <div className="pref-cards-stack">
                  {/* Pure Veg */}
                  <div className="pref-item-card">
                    <div className="pref-item-icon veg">
                      <FaLeaf />
                    </div>
                    <div className="pref-item-info">
                      <h4>Pure Vegetarian Default</h4>
                      <p>Automatically prioritize pure veg items and hide non-veg dishes across the menu.</p>
                    </div>
                    <button
                      type="button"
                      className={`custom-switch-btn ${pureVegOnly ? "active" : ""}`}
                      onClick={handleToggleVeg}
                      aria-label="Toggle Pure Veg Mode"
                    >
                      <span className="switch-slider"></span>
                    </button>
                  </div>

                  {/* Spice Level */}
                  <div className="pref-item-card col-layout">
                    <div className="pref-item-top">
                      <div className="pref-item-icon amber">
                        <FaUtensils />
                      </div>
                      <div className="pref-item-info">
                        <h4>Spice Preference</h4>
                        <p>Kitchen prepares live gravies and noodles aligned with your taste preference.</p>
                      </div>
                    </div>
                    <div className="spice-pills-row">
                      {["Mild", "Medium", "Spicy", "Extra Spicy"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          className={`spice-pill-btn ${spiceLevel.toLowerCase() === lvl.toLowerCase() ? "active" : ""}`}
                          onClick={() => handleSpiceChange(lvl.toLowerCase())}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eco-Cutlery */}
                  <div className="pref-item-card">
                    <div className="pref-item-icon green">
                      <FaCheckCircle />
                    </div>
                    <div className="pref-item-info">
                      <h4>Eco-Friendly Wooden Cutlery</h4>
                      <p>Support SREC's Green Campus initiative by opting for biodegradable spoons and forks.</p>
                    </div>
                    <button
                      type="button"
                      className={`custom-switch-btn ${ecoCutlery ? "active" : ""}`}
                      onClick={handleToggleCutlery}
                      aria-label="Toggle Eco Cutlery"
                    >
                      <span className="switch-slider"></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="settings-tab-pane">
                <div className="pane-header">
                  <h2>Notifications & Sound Alerts</h2>
                  <p>Control auditory chimes and real-time order status updates.</p>
                </div>

                <div className="pref-cards-stack">
                  {/* Sound Alerts */}
                  <div className="pref-item-card">
                    <div className="pref-item-icon bell">
                      <FaBell />
                    </div>
                    <div className="pref-item-info">
                      <h4>Audio Chimes & Notification Sounds</h4>
                      <p>Play pleasant notification chimes when your food token moves to 'Preparing' and 'Ready'.</p>
                    </div>
                    <button
                      type="button"
                      className={`custom-switch-btn ${soundAlerts ? "active" : ""}`}
                      onClick={handleToggleSound}
                      aria-label="Toggle Audio Chimes"
                    >
                      <span className="switch-slider"></span>
                    </button>
                  </div>

                  {/* SMS Readiness */}
                  <div className="pref-item-card">
                    <div className="pref-item-icon blue">
                      <FaEnvelope />
                    </div>
                    <div className="pref-item-info">
                      <h4>Instant SMS Pickup Alerts</h4>
                      <p>Receive an automated SMS to your registered phone when order is packed and ready.</p>
                    </div>
                    <button
                      type="button"
                      className={`custom-switch-btn ${smsAlerts ? "active" : ""}`}
                      onClick={handleToggleSms}
                      aria-label="Toggle SMS Alerts"
                    >
                      <span className="switch-slider"></span>
                    </button>
                  </div>

                  {/* Specials Broadcast */}
                  <div className="pref-item-card">
                    <div className="pref-item-icon orange">
                      <FaUtensils />
                    </div>
                    <div className="pref-item-info">
                      <h4>Chef's Daily Specials Broadcast</h4>
                      <p>Get notified about today's discounted combo meals and limited-time dessert specials.</p>
                    </div>
                    <button
                      type="button"
                      className={`custom-switch-btn ${specialsAlerts ? "active" : ""}`}
                      onClick={handleToggleSpecials}
                      aria-label="Toggle Specials Alerts"
                    >
                      <span className="switch-slider"></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SECURITY & ACCOUNT TAB */}
            {activeTab === "security" && (
              <div className="settings-tab-pane">
                <div className="pane-header">
                  <h2>Security & Password</h2>
                  <p>Keep your SREC student account protected with encrypted credentials.</p>
                </div>

                <form className="settings-form-grid" onSubmit={handleUpdatePassword}>
                  <div className="form-field-group">
                    <label>Current Password</label>
                    <div className="input-icon-field">
                      <FaLock className="field-icon" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={currPass}
                        onChange={(e) => setCurrPass(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        className="pass-eye-toggle"
                        onClick={() => setShowPass(!showPass)}
                      >
                        {showPass ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>New Password</label>
                    <div className="input-icon-field">
                      <FaLock className="field-icon" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>Confirm New Password</label>
                    <div className="input-icon-field">
                      <FaLock className="field-icon" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="submit" className="save-settings-btn">
                      <FaShieldAlt /> Update Password
                    </button>
                  </div>
                </form>

                <div className="danger-zone-card">
                  <div className="danger-text">
                    <h4>Session Management</h4>
                    <p>Signing out clears your cart state and active order cache from this browser.</p>
                  </div>
                  <button type="button" className="danger-logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
