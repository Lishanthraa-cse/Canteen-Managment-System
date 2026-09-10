import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaUtensils, FaArrowLeft } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./LoginPage.css";

const LoginPage = () => {
  const { setCurrentUser, showToast } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }

    setLoading(true);

    // Try Firebase Authentication first
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      const userData = {
        email: user.email,
        name: user.displayName || user.email.split("@")[0],
        uid: user.uid,
      };
      setCurrentUser(userData);
      localStorage.setItem("userEmail", user.email);
      showToast("🎉 Welcome to SREC Smart Canteen!", "success");
      navigate("/usershomepage");
      return;
    } catch (fbError) {
      console.warn("Firebase sign-in failed, trying backend auth fallback:", fbError.message);
    }

    // Backend Auth Fallback
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
        showToast("🎉 Welcome back to SREC Canteen!", "success");
        navigate("/usershomepage");
      } else {
        showToast(data.message || "Invalid credentials. Please verify your email & password.", "error");
      }
    } catch (err) {
      showToast("Network error during login", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      email: "student@srec.ac.in",
      name: "Priya (Demo Student)",
      phone: "9876543210",
    };
    setCurrentUser(demoUser);
    localStorage.setItem("userEmail", demoUser.email);
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

          <div className="form-input-box">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
