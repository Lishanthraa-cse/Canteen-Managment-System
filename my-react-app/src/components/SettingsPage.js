import React, { useState } from "react";
import "./SettingsPage.css";
import { auth } from "../firebase.js";
import { updatePassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [password, setPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("⚠️ You must be logged in to update settings.");
        return;
      }

      // Update password only if entered
      if (password.trim()) {
        await updatePassword(user, password);
        alert("✅ Password updated. You will be logged out now for security.");

        // Clear localStorage if needed
        localStorage.removeItem("userEmail");

        // Sign out user and redirect to login page
        await signOut(auth);
        navigate("/login");
        return;
      }

      // Other updates (if needed)
      localStorage.setItem("userEmail", email);
      console.log("Updated Settings:", { name, email, darkMode });
      alert("✅ Settings saved successfully!");

    } catch (error) {
      console.error("Error updating settings:", error.message);
      if (error.code === "auth/requires-recent-login") {
        alert("⚠️ Please log in again to update your password.");
      } else {
        alert("❌ " + error.message);
      }
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">⚙️ User Settings</h2>

      <form className="settings-form" onSubmit={handleSave}>
        <label>
          👤 Full Name
          <input
            type="text"
            value={name}
            placeholder="Enter your full name"
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          📧 Email Address
          <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          🔒 New Password
          <input
            type="password"
            value={password}
            placeholder="Enter a new password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label className="dark-mode-toggle">
          🌙 Enable Dark Mode
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
        </label>

        <button type="submit" className="save-btn">
          💾 Save Changes
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
