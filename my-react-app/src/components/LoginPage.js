import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaUtensils, FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./LoginPage.css";

const LoginPage = () => {
  const { setCurrentUser, setUserSession, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("canteen_remember_me") === "true");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isRemembered = localStorage.getItem("canteen_remember_me") === "true";
    if (isRemembered) {
      const savedEmail = localStorage.getItem("canteen_saved_email") || "";
      const savedPass = localStorage.getItem("canteen_saved_pass") || "";
      if (savedEmail) setEmail(savedEmail);
      if (savedPass) setPassword(savedPass);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("userEmail", data.user.email);
        setUserSession(data.user, data.token);

        // Save password if Remember Me is checked
        if (rememberMe) {
          localStorage.setItem("canteen_remember_me", "true");
          localStorage.setItem("canteen_saved_email", email.trim());
          localStorage.setItem("canteen_saved_pass", password);
        } else {
          localStorage.removeItem("canteen_remember_me");
          localStorage.removeItem("canteen_saved_email");
          localStorage.removeItem("canteen_saved_pass");
        }

        showToast("🎉 Welcome back to SREC Canteen!", "success");
        navigate("/usershomepage");
      } else {
        showToast(data.message || "Invalid credentials. Please verify your email & password.", "error");
      }
    } catch (err) {
      showToast("Network error connecting to backend. Please check server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: "demo_student_id",
      email: "student@srec.ac.in",
      name: "Priya (Demo Student)",
      phone: "9876543210",
    };
    setCurrentUser(demoUser);
    localStorage.setItem("userEmail", demoUser.email);
    setUserSession(demoUser, "demo_jwt_token_srec");
    showToast("Logged in as Demo Student!", "success");
    navigate("/usershomepage");
  };

  return (
    <div className="login-page-root">
      <div className="login-card-box">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="login-card-header">
          <div className="header-icon">
            <FaUtensils />
          </div>
          <h1>Student Sign In</h1>
          <p>Access today's menu, live token tracker & favorites.</p>
        </div>

        {/* 1-Click Demo Login Helper */}
        <div className="demo-helper-strip" onClick={handleDemoLogin}>
          <div>
            <strong>1-Click Student Demo Access</strong>
            <span>Click to explore app as Priya (SREC CSE)</span>
          </div>
          <button type="button" className="demo-fill-btn">
            Quick In ➔
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form-wrap">
          <div className="form-input-box">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="Student Email (@srec.ac.in)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-input-box password-input-box">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="pwd-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="remember-me-container">
            <label className="remember-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me & save password</span>
            </label>
          </div>

          <button type="submit" className="login-cta-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In ➔"}
          </button>
        </form>

        <div className="login-links-row">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="signup-text-link">
              Register here
            </Link>
          </p>
          <p>
            Are you canteen staff?{" "}
            <Link to="/adminlogin" className="admin-text-link">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
