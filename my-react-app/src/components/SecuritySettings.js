import React, { useState } from "react";
import "./SecuritySettings.css";

const SecuritySettings = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(15); // minutes
  const [failedLoginAlerts, setFailedLoginAlerts] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/security/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        alert(data.message || "Failed to update password");
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };
  

  return (
    <div className="security-settings-container">
      <h2>Security Settings</h2>

      <form className="password-form" onSubmit={handlePasswordChange}>
        <h3>Change Admin Password</h3>
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Update Password</button>
      </form>

      <div className="setting-toggle">
        <h3>Two-Factor Authentication</h3>
        <label className="switch">
          <input type="checkbox" checked={twoFA} onChange={() => setTwoFA(!twoFA)} />
          <span className="slider round"></span>
        </label>
      </div>

      <div className="setting-select">
        <h3>Session Timeout</h3>
        <select value={sessionTimeout} onChange={(e) => setSessionTimeout(Number(e.target.value))}>
          <option value={5}>5 minutes</option>
          <option value={10}>10 minutes</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
        </select>
      </div>

      <div className="setting-toggle">
        <h3>Failed Login Attempt Alerts</h3>
        <label className="switch">
          <input type="checkbox" checked={failedLoginAlerts} onChange={() => setFailedLoginAlerts(!failedLoginAlerts)} />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
};

export default SecuritySettings;
