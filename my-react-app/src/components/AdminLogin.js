import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaLock, FaEnvelope, FaArrowLeft, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import campusLogo from "../assets/campuseats-logo.png";
import "./AdminLogin.css";

const AdminLogin = () => {
  const { setAdminSession, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter admin email and password", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setAdminSession(data.token);
        showToast("✅ Welcome back, Admin!", "success");
        navigate("/admindashboard");
      } else {
        showToast(data.message || "Invalid Admin Credentials", "error");
      }
    } catch (err) {
      showToast("Network error during login", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillDemo = () => {
    setEmail("admin@srec.ac.in");
    setPassword("admin123");
    showToast("Filled demo admin credentials!", "info");
  };

  return (
    <div className="admin-login-root">
      <div className="login-backdrop-glow"></div>

      <div className="admin-login-card">
        <Link to="/" className="back-home-link">
          <FaArrowLeft /> Back to Canteen
        </Link>

        <div className="admin-login-header">
          <div className="admin-shield-icon">
            <img src={campusLogo} alt="CampusEats Admin" style={{ height: "48px", width: "auto", objectFit: "contain", background: "#ffffff", padding: "4px 8px", borderRadius: "8px" }} />
          </div>
          <h1>CampusEats Admin Portal</h1>
          <p>Restricted access for canteen staff & cafeteria operations.</p>
        </div>

        {/* Demo Fast-fill banner for recruiters */}
        <div className="demo-credentials-badge">
          <div className="demo-text">
            <strong>Recruiter / Demo Credentials:</strong>
            <span>admin@srec.ac.in • admin123</span>
          </div>
          <button type="button" className="auto-fill-btn" onClick={handleAutoFillDemo}>
            <FaKey /> Auto Fill
          </button>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="input-field-wrap">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Admin Email (@srec.ac.in)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-field-wrap password-wrap">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="admin-pwd-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In to Operations ➔"}
          </button>
        </form>

        <div className="admin-login-footer">
          <span>Protected by SREC Department Security • JWT Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
