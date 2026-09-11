import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaDatabase,
  FaDownload,
  FaFileCsv,
  FaArrowLeft,
  FaSync,
  FaCheckCircle,
  FaServer,
  FaHistory,
  FaShieldAlt,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./DatabaseBackup.css";

const DatabaseBackup = () => {
  const { showToast } = useApp();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastBackupStats, setLastBackupStats] = useState(null);

  const fetchBackupList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backup/list");
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error("Failed to load backups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackupList();
  }, [fetchBackupList]);

  // 1-Click Create Snapshot
  const handleCreateSnapshot = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/backup/backup");
      const data = await res.json();
      if (res.ok) {
        showToast("🎉 Database Snapshot created successfully!", "success");
        setLastBackupStats(data.stats);
        fetchBackupList();
      } else {
        showToast(data.message || "Failed to create snapshot", "error");
      }
    } catch (err) {
      showToast("Network error creating database snapshot", "error");
    } finally {
      setCreating(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    showToast("Generating Orders CSV Export...", "info");
    window.open("/api/backup/export/csv", "_blank");
  };

  // Download Snapshot JSON
  const handleDownloadSnapshot = (fileName) => {
    window.open(`/api/backup/download/${fileName}`, "_blank");
  };

  return (
    <div className="backup-page-root">
      {/* Top Navigation */}
      <header className="backup-top-nav">
        <Link to="/admindashboard" className="back-link">
          <FaArrowLeft /> Dashboard
        </Link>
        <h2>
          <FaDatabase className="header-icon" /> Cloud Database Backup & Disaster Recovery
        </h2>
        <button className="sync-btn" onClick={fetchBackupList} title="Refresh backup history">
          <FaSync className={loading ? "spin" : ""} /> Refresh
        </button>
      </header>

      <main className="backup-container">
        {/* Quick Action Cards Grid */}
        <section className="backup-actions-grid">
          <div className="backup-action-card highlight-card">
            <div className="card-badge">Full System Snapshot</div>
            <div className="action-icon">
              <FaServer />
            </div>
            <h3>Create JSON Database Snapshot</h3>
            <p>
              Instantly dumps active menu items, live orders, customer feedback, and audit logs into a portable JSON snapshot.
            </p>
            <button
              className="action-btn primary-btn"
              onClick={handleCreateSnapshot}
              disabled={creating}
            >
              {creating ? "Generating Snapshot..." : "Create Full Backup ➔"}
            </button>
          </div>

          <div className="backup-action-card">
            <div className="card-badge green-badge">Sales & Finance</div>
            <div className="action-icon csv-icon">
              <FaFileCsv />
            </div>
            <h3>Export Orders Telemetry (CSV)</h3>
            <p>
              Download a clean spreadsheet format of all customer transactions, revenue amounts, payment statuses, and timestamps.
            </p>
            <button className="action-btn secondary-btn" onClick={handleExportCsv}>
              <FaDownload /> Download Orders CSV
            </button>
          </div>
        </section>

        {/* Latest Snapshot Telemetry Card */}
        {lastBackupStats && (
          <section className="telemetry-banner">
            <div className="telemetry-header">
              <FaCheckCircle className="check-icon" />
              <h4>Latest Snapshot Metrics Summary</h4>
            </div>
            <div className="telemetry-pills-row">
              <div className="telemetry-pill">
                <strong>{lastBackupStats.totalMenuItems}</strong>
                <span>Menu Dishes</span>
              </div>
              <div className="telemetry-pill">
                <strong>{lastBackupStats.totalOrders}</strong>
                <span>Total Orders</span>
              </div>
              <div className="telemetry-pill">
                <strong>{lastBackupStats.totalFeedbacks}</strong>
                <span>Reviews</span>
              </div>
              <div className="telemetry-pill">
                <strong>{lastBackupStats.totalLogs}</strong>
                <span>Audit Logs</span>
              </div>
            </div>
          </section>
        )}

        {/* Backup History Table */}
        <section className="backup-history-box">
          <div className="history-header">
            <FaHistory />
            <h3>Snapshot Storage Archive</h3>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Scanning storage repository...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="empty-state">
              <FaShieldAlt className="shield-empty-icon" />
              <p>No snapshots found yet. Click <strong>"Create Full Backup"</strong> above to capture the first archive.</p>
            </div>
          ) : (
            <div className="table-responsive-box">
              <table className="backup-table">
                <thead>
                  <tr>
                    <th>Snapshot Filename</th>
                    <th>Size</th>
                    <th>Created Timestamp</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((b, idx) => (
                    <tr key={idx}>
                      <td className="file-name-cell">
                        <FaDatabase className="table-file-icon" />
                        <span>{b.fileName}</span>
                      </td>
                      <td>{(b.size / 1024).toFixed(1)} KB</td>
                      <td>{new Date(b.createdAt).toLocaleString("en-IN")}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="download-file-btn"
                          onClick={() => handleDownloadSnapshot(b.fileName)}
                          title="Download snapshot JSON"
                        >
                          <FaDownload /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DatabaseBackup;

