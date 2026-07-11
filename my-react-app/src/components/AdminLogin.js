import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import logo from "../assets/collegeImage.jpg";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Add your login logic here
    if (email === "admin@srec.ac.in" && password === "admin123") {
      alert("Login Successful");
      navigate("/admindashboard"); // redirect to admin dashboard
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <img src={logo} alt="SREC Logo" className="admin-logo" />
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@srec.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
