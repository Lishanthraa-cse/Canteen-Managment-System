import React, { useEffect, useState, useCallback } from "react";
import {
  FaSearch,
  FaCheck,
  FaFire,
  FaShoppingBag,
  FaCheckCircle,
  FaTimes,
  FaSync,
  FaReceipt,
  FaPhone,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import socket from "../socket";
import AdminSidebar from "./AdminSidebar";
import "./OrderResponse.css";

const OrderResponse = () => {
  const { showToast, isDarkMode } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/order");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      showToast("Error loading kitchen orders", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrders();

    socket.emit("joinAdminRoom");

    const handleNewOrder = (data) => {
      showToast(`🔔 New Order #${data.order?.orderNumber} received!`, "info");
      fetchOrders();
    };

    socket.on("newOrder", handleNewOrder);
    return () => socket.off("newOrder", handleNewOrder);
  }, [fetchOrders, showToast]);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/order/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order status changed to: ${newStatus}`, "success");
      } else {
        showToast("Failed to update status. Please try again.", "error");
      }
    } catch (err) {
      showToast("Network error updating order status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.phone?.includes(search);

    const matchesStatus = filterStatus === "ALL" || o.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`admin-portal-root ${isDarkMode ? "dark-theme" : ""}`}>
      <AdminSidebar />
      <div className="admin-main-viewport" style={{ padding: 0 }}>
        <div className="admin-orders-manager-root">
      <div className="orders-top-nav">
        <div className="top-nav-title">
          <h2>🍳 Kitchen Live Orders Kanban</h2>
          <span className="live-pulse-badge">● LIVE SYNC</span>
        </div>
        <button className="refresh-btn" onClick={fetchOrders}>
          <FaSync className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      <div className="manager-body-container">
        {/* Filter Controls Bar */}
        <div className="orders-filters-bar">
          <div className="search-box">
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Search token #, student name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="status-filter-pills">
            {["ALL", "Pending", "Confirmed", "Preparing", "Ready", "Completed"].map((status) => (
              <button
                key={status}
                className={`filter-pill ${filterStatus === status ? "active" : ""}`}
                onClick={() => setFilterStatus(status)}
              >
                {status === "ALL" ? "All Orders" : status}
                <span className="pill-count">
                  {status === "ALL"
                    ? orders.length
                    : orders.filter((o) => o.status === status).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Kanban Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading live kitchen orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders-state">
            <FaReceipt className="empty-icon" />
            <h3>No orders matching "{filterStatus}"</h3>
            <p>New orders will automatically appear here via Socket.IO real-time stream.</p>
          </div>
        ) : (
          <div className="kanban-orders-grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className={`kanban-card ${order.status.toLowerCase()}`}>
                {/* Header */}
                <div className="card-top-row">
                  <div className="token-col">
                    <span className="token-label">TOKEN</span>
                    <h3>{order.orderNumber}</h3>
                  </div>
                  <div className="status-col">
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    <span className="time-ago">
                      {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now"}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="customer-info-box">
                  <div className="cust-row">
                    <strong>{order.customerName}</strong>
                    <span>{order.tableNumber || "Counter"}</span>
                  </div>
                  <div className="contact-row">
                    <span className="phone">
                      <FaPhone /> {order.phone}
                    </span>
                    <span className="payment-pill">{order.paymentMethod} • {order.paymentStatus}</span>
                  </div>
                  {order.notes && <p className="notes-box">📝 Notes: {order.notes}</p>}
                </div>

                {/* Dishes List */}
                <div className="dishes-list-box">
                  <h4>Dishes to Prepare:</h4>
                  <ul>
                    {order.items?.map((it, idx) => (
                      <li key={idx}>
                        <span className="dish-name">
                          <strong>{it.quantity}x</strong> {it.name}
                        </span>
                        <span className="dish-price">₹{(Number(it.price) * it.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="order-total-row">
                    <span>Total Amount:</span>
                    <strong className="total-val">₹{Number(order.totalAmount).toFixed(2)}</strong>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="status-action-btns">
                  {order.status === "Pending" && (
                    <button
                      className="btn-action confirm"
                      onClick={() => updateOrderStatus(order._id, "Confirmed")}
                      disabled={updatingId === order._id}
                    >
                      <FaCheck /> Accept Order
                    </button>
                  )}

                  {(order.status === "Pending" || order.status === "Confirmed") && (
                    <button
                      className="btn-action cook"
                      onClick={() => updateOrderStatus(order._id, "Preparing")}
                      disabled={updatingId === order._id}
                    >
                      <FaFire /> Start Cooking
                    </button>
                  )}

                  {order.status === "Preparing" && (
                    <button
                      className="btn-action ready"
                      onClick={() => updateOrderStatus(order._id, "Ready")}
                      disabled={updatingId === order._id}
                    >
                      <FaShoppingBag /> Mark Ready for Pickup
                    </button>
                  )}

                  {order.status === "Ready" && (
                    <button
                      className="btn-action complete"
                      onClick={() => updateOrderStatus(order._id, "Completed")}
                      disabled={updatingId === order._id}
                    >
                      <FaCheckCircle /> Handover & Complete
                    </button>
                  )}

                  {order.status !== "Completed" && order.status !== "Cancelled" && (
                    <button
                      className="btn-action cancel"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to cancel this order?")) {
                          updateOrderStatus(order._id, "Cancelled");
                        }
                      }}
                      disabled={updatingId === order._id}
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default OrderResponse;
