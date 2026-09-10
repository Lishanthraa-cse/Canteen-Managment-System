import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUtensils,
  FaShoppingCart,
  FaHeart,
  FaHistory,
  FaUserCircle,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./Navbar.css";

const Navbar = () => {
  const { cartCount, favorites, currentUser, logout, activeOrder } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="modern-navbar-container">
      <nav className="modern-navbar">
        {/* Brand */}
        <Link to="/usershomepage" className="brand-logo">
          <div className="logo-icon-wrap">
            <FaUtensils className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">SREC CANTEEN</span>
            <span className="brand-subtitle">Smart Food Hub</span>
          </div>
        </Link>

        {/* Live Active Order Stepper Pill */}
        {activeOrder && activeOrder.status !== "Completed" && activeOrder.status !== "Cancelled" && (
          <Link to="/viewmyorder" className="live-order-pill">
            <span className="pulse-indicator"></span>
            <span className="pill-text">
              Order {activeOrder.orderNumber || ""}: <strong>{activeOrder.status}</strong>
            </span>
          </Link>
        )}

        {/* Desktop Nav Links */}
        <div className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link
            to="/usershomepage"
            className={`nav-item ${isActive("/usershomepage") ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/menu"
            className={`nav-item ${isActive("/menu") ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Menu
          </Link>
          <Link
            to="/viewmyorder"
            className={`nav-item ${isActive("/viewmyorder") ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaHistory className="inline-icon" /> Orders
          </Link>
          <Link
            to="/scheduleorder"
            className={`nav-item ${isActive("/scheduleorder") ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaCalendarAlt className="inline-icon" /> Schedule
          </Link>
          <Link
            to="/favorites"
            className={`nav-item badge-item ${isActive("/favorites") ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaHeart className="inline-icon" />
            <span>Favorites</span>
            {favorites.length > 0 && <span className="nav-badge heart-badge">{favorites.length}</span>}
          </Link>
          <Link
            to="/cart"
            className={`nav-item cart-btn ${isActive("/cart") ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaShoppingCart />
            <span>Cart</span>
            {cartCount > 0 && <span className="nav-badge cart-badge">{cartCount}</span>}
          </Link>
        </div>

        {/* Right Section: User Dropdown / Login */}
        <div className="nav-right">
          {currentUser ? (
            <div className="user-profile-menu">
              <button
                className="profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User Menu"
              >
                <FaUserCircle className="user-avatar" />
                <span className="user-name">{currentUser.name || currentUser.email.split("@")[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu-box" onMouseLeave={() => setDropdownOpen(false)}>
                  <div className="dropdown-header">
                    <p className="user-email-tag">{currentUser.email}</p>
                    <span className="role-badge">Student</span>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link
                    to="/viewmyorder"
                    className="dropdown-link"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaHistory /> Order History
                  </Link>
                  <Link
                    to="/favorites"
                    className="dropdown-link"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaHeart /> My Favorites
                  </Link>
                  <Link
                    to="/settingd"
                    className="dropdown-link"
                    onClick={() => setDropdownOpen(false)}
                  >
                    ⚙️ Settings
                  </Link>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-link logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="login-link">
                Sign In
              </Link>
              <Link to="/signup" className="signup-link">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

