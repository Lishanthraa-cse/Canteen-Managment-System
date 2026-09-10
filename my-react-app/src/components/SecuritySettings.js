import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaKey, FaArrowLeft } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./SecuritySettings.css";

const SecuritySettings = () => {
  const { showToast } = useApp();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(15);
  const [failedLoginAlerts, setFailedLoginAlerts] = useState(true);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match!", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("New password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("✅ Admin password updated successfully!", "success");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.message || "Failed to update password", "error");
      }
    } catch (err) {
      showToast("Network error updating password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-mgmt-root">
      <div className="security-top-nav">
        <Link to="/admindashboard" className="back-link">
          <FaArrowLeft /> Dashboard
        </Link>
        <h2>🔒 Security & Access Preferences</h2>
        <div></div>
      </div>

      <main className="security-container">
        <div className="security-card">
          <div className="card-header">
            <FaKey className="key-icon" />
            <div>
              <h3>Change Operations Password</h3>
              <p>Update credentials for SREC canteen administrative access.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="password-form-box">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="update-password-btn" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <hr className="divider" />

          {/* Additional Preferences */}
          <div className="preferences-section">
            <div className="pref-row">
              <div>
                <h4>Two-Factor Authentication (2FA)</h4>
                <p>Require verification code via SREC faculty email on login</p>
              </div>
              <label className="switch-toggle">
                <input
                  type="checkbox"
                  checked={twoFA}
                  onChange={(e) => {
                    setTwoFA(e.target.checked);
                    showToast(`2FA is now ${e.target.checked ? "Enabled" : "Disabled"}`, "info");
                  }}
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="pref-row">
              <div>
                <h4>Session Auto-Logout</h4>
                <p>Automatically lock dashboard when inactive</p>
              </div>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="timeout-select"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>1 Hour</option>
              </select>
            </div>

            <div className="pref-row">
              <div>
                <h4>Suspicious Activity Alerts</h4>
                <p>Log and notify on failed login attempts</p>
              </div>
              <label className="switch-toggle">
                <input
                  type="checkbox"
                  checked={failedLoginAlerts}
                  onChange={(e) => setFailedLoginAlerts(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecuritySettings;
