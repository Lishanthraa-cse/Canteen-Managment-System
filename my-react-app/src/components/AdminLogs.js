import React, { useEffect, useState } from "react";
import "./AdminLogs.css";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Mock Data (Replace with API call in real use)
    const mockLogs = [
      { id: 1, timestamp: "2025-04-04 09:45 AM", action: "Logged in", ip: "192.168.1.12", status: "Success" },
      { id: 2, timestamp: "2025-04-04 10:12 AM", action: "Changed password", ip: "192.168.1.12", status: "Success" },
      { id: 3, timestamp: "2025-04-04 10:45 AM", action: "Failed login attempt", ip: "192.168.1.55", status: "Failed" },
      { id: 4, timestamp: "2025-04-04 11:10 AM", action: "Updated menu", ip: "192.168.1.12", status: "Success" },
    ];
    setLogs(mockLogs);
  }, []);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["Timestamp,Action,IP,Status", ...logs.map(log => `${log.timestamp},${log.action},${log.ip},${log.status}`)].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "admin_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-logs-container">
      <h2>Admin Access Logs</h2>
      <button className="export-btn" onClick={exportCSV}>Export Logs (CSV)</button>

      <table className="logs-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>IP Address</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.timestamp}</td>
              <td>{log.action}</td>
              <td>{log.ip}</td>
              <td className={log.status === "Failed" ? "status-fail" : "status-success"}>{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLogs;
