import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaArrowLeft, FaUtensils } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./SignUp.css";

const SignUp = () => {
  const { setUserSession, showToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || email.split("@")[0],
          email: email.trim(),
          phone: phone.trim() || "Not Provided",
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUserSession(data.user, data.token);
        showToast("🎉 Registration successful! Welcome to SREC Canteen.", "success");
        navigate("/usershomepage");
      } else {
        showToast(data.message || "Registration failed. Please try again.", "error");
      }
    } catch (err) {
      showToast("Network error connecting to backend. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page-root">
      <div className="signup-card-box">
        <Link to="/" className="back-link">
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="signup-card-header">
          <div className="header-icon">
            <FaUtensils />
          </div>
          <h1>Create Student Account</h1>
          <p>Join SREC Smart Canteen for fast, line-free ordering.</p>
        </div>

        <form onSubmit={handleSignUp} className="signup-form-wrap">
          <div className="form-input-box">
            <FaUser className="icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-input-box">
            <FaEnvelope className="icon" />
            <input
              type="email"
              placeholder="College Email (@srec.ac.in)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-input-box">
            <FaPhone className="icon" />
            <input
              type="tel"
              placeholder="Mobile Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-input-box">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password (Min. 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="signup-cta-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account ➔"}
          </button>
        </form>

        <p className="login-switch-text">
          Already have an account?{" "}
          <Link to="/login" className="login-text-link">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
