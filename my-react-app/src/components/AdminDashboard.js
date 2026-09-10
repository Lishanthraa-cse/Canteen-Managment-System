import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClipboardList,
  FaUtensils,
  FaBell,
  FaShieldAlt,
  FaChartBar,
  FaExclamationTriangle,
  FaLock,
  FaDatabase,
  FaMoon,
  FaSun,
  FaBars,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaSync,
  FaSignOutAlt,
} from "react-icons/fa";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { useApp } from "../context/AppContext";
import socket from "../socket";
import notificationSound from "../assets/notification.mp3";
import "./AdminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AdminDashboard = () => {
  const { adminToken, logoutAdmin, showToast } = useApp();
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audio] = useState(() => new Audio(notificationSound));
  const navigate = useNavigate();

  const menuItems = [
    { path: "/admindashboard", icon: <FaChartBar />, title: "Overview Dashboard" },
    { path: "/order", icon: <FaClipboardList />, title: "Live Orders Kanban" },
    { path: "/admin", icon: <FaUtensils />, title: "Menu Management" },
    { path: "/notifications", icon: <FaBell />, title: "Notifications" },
    { path: "/specials", icon: <FaExclamationTriangle />, title: "Daily Specials" },
    { path: "/feedback", icon: <FaLock />, title: "Student Reviews" },
    { path: "/adminlogs", icon: <FaClipboardList />, title: "Activity Logs" },
    { path: "/securitysettings", icon: <FaShieldAlt />, title: "Security Settings" },
    { path: "/backup", icon: <FaDatabase />, title: "Database Backup" },
  ];

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else if (res.status === 401 || res.status === 403) {
        // Fallback for demo if unauthenticated
        showToast("Please login with Admin credentials", "info");
        navigate("/adminlogin");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/adminlogin");
      return;
    }

    fetchStats();

    // Socket.io room registration & live orders chime
    socket.emit("joinAdminRoom");

    const handleNewOrder = (data) => {
      try {
        audio.play().catch(() => {});
      } catch {}
      showToast(`📢 New Order #${data.order?.orderNumber} received!`, "success");
      fetchStats();
    };

    socket.on("newOrder", handleNewOrder);
    return () => socket.off("newOrder", handleNewOrder);
  }, [fetchStats, audio, navigate, showToast]);

  // Chart data setup
  const salesChartData = {
    labels: stats?.chartData?.map((d) => d.label) || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Daily Revenue (₹)",
        data: stats?.chartData?.map((d) => d.sales) || [1200, 1900, 3000, 2500, 3200, 4100, 3800],
        fill: true,
        borderColor: "#ea580c",
        backgroundColor: "rgba(234, 88, 12, 0.1)",
        tension: 0.35,
        pointBackgroundColor: "#ea580c",
      },
    ],
  };

  const categoryChartData = {
    labels: stats?.categoryCounts ? Object.keys(stats.categoryCounts) : ["South Indian", "Meals", "Snacks", "Beverages"],
    datasets: [
      {
        data: stats?.categoryCounts ? Object.values(stats.categoryCounts) : [6, 5, 5, 5],
        backgroundColor: ["#ea580c", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className={`admin-portal-root ${darkMode ? "dark-theme" : ""}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="admin-brand-header">
          <div className="brand-logo-cluster">
            <FaUtensils className="sidebar-logo-icon" />
            {sidebarOpen && <span>SREC Admin</span>}
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        </div>

        {sidebarOpen && (
          <div className="sidebar-search-box">
            <input
              type="text"
              placeholder="Search panel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <nav className="sidebar-nav-list">
          {menuItems
            .filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className={`sidebar-nav-link ${item.path === "/admindashboard" ? "active" : ""}`}
                title={!sidebarOpen ? item.title : ""}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {sidebarOpen && <span className="sidebar-text">{item.title}</span>}
              </Link>
            ))}
        </nav>

        <div className="sidebar-footer-box">
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark Mode"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
            {sidebarOpen && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <button
            className="admin-logout-btn"
            onClick={() => {
              logoutAdmin();
              navigate("/adminlogin");
            }}
            title="Sign out of admin"
          >
            <FaSignOutAlt />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-viewport">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="topbar-welcome">
            <h1>Canteen Operations Overview</h1>
            <p>Real-time orders, menu inventory, and sales analytics.</p>
          </div>

          <div className="topbar-right-actions">
            <button className="sync-btn" onClick={fetchStats} title="Refresh live statistics">
              <FaSync className={loading ? "spin" : ""} /> Refresh
            </button>
            <Link to="/order" className="view-live-orders-btn">
              <FaClipboardList /> Live Order Board ➔
            </Link>
          </div>
        </header>

        {/* 4 Core KPI Stat Cards */}
        <section className="kpi-cards-grid">
          <div className="kpi-card orange">
            <div className="kpi-icon-wrap">
              <FaRupeeSign />
            </div>
            <div className="kpi-data">
              <span className="kpi-label">Today's Sales</span>
              <h2>₹{stats?.todayRevenue?.toFixed(2) || "0.00"}</h2>
              <span className="kpi-sub">Total: ₹{stats?.totalRevenue?.toFixed(2) || "0.00"}</span>
            </div>
          </div>

          <div className="kpi-card blue">
            <div className="kpi-icon-wrap">
              <FaClipboardList />
            </div>
            <div className="kpi-data">
              <span className="kpi-label">Today's Orders</span>
              <h2>{stats?.todayOrdersCount || 0}</h2>
              <span className="kpi-sub">All-time: {stats?.totalOrders || 0} Orders</span>
            </div>
          </div>

          <div className="kpi-card amber">
            <div className="kpi-icon-wrap">
              <FaClock />
            </div>
            <div className="kpi-data">
              <span className="kpi-label">Pending Orders</span>
              <h2>{stats?.pendingOrdersCount || 0}</h2>
              <span className="kpi-sub">Kitchen queue waiting</span>
            </div>
          </div>

          <div className="kpi-card green">
            <div className="kpi-icon-wrap">
              <FaUtensils />
            </div>
            <div className="kpi-data">
              <span className="kpi-label">Active Menu Dishes</span>
              <h2>{stats?.totalMenuItems || 21}</h2>
              <span className="kpi-sub">{stats?.outOfStockItems || 0} Out of Stock</span>
            </div>
          </div>
        </section>

        {/* Visual Charts Grid */}
        <section className="charts-grid-section">
          <div className="chart-panel sales-chart-panel">
            <div className="chart-header">
              <h3>📈 7-Day Revenue Trend</h3>
              <span className="chart-badge">Live Trend</span>
            </div>
            <div className="chart-canvas-wrap">
              <Line
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>

          <div className="chart-panel category-chart-panel">
            <div className="chart-header">
              <h3>🍩 Menu Categories Breakdown</h3>
            </div>
            <div className="chart-canvas-wrap doughnut-wrap">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </section>

        {/* Recent Orders Snapshot Table */}
        <section className="recent-orders-admin-panel">
          <div className="panel-header-row">
            <h3>Recent Orders Placed</h3>
            <Link to="/order" className="view-all-orders-link">
              Manage in Live Kanban ➔
            </Link>
          </div>

          <div className="table-responsive-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Token / Order #</th>
                  <th>Customer</th>
                  <th>Dining / Table</th>
                  <th>Dishes</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <strong>{o.orderNumber}</strong>
                      </td>
                      <td>
                        <span>{o.customerName}</span>
                        <small className="cell-sub">{o.email}</small>
                      </td>
                      <td>{o.tableNumber}</td>
                      <td>
                        {o.items?.map((it) => `${it.quantity}x ${it.name}`).join(", ")}
                      </td>
                      <td>
                        <strong>₹{Number(o.totalAmount).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className="badge-paid">{o.paymentStatus}</span>
                      </td>
                      <td>
                        <span className={`status-tag ${o.status.toLowerCase()}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                      No recent orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
