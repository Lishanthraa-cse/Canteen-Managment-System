import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaUtensils,
  FaFire,
  FaShoppingBag,
  FaReceipt,
  FaSync,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import socket from "../socket";
import "./ViewMyOrder.css";

const statusSteps = [
  { key: "Pending", label: "Order Placed", icon: FaReceipt },
  { key: "Confirmed", label: "Confirmed", icon: FaCheckCircle },
  { key: "Preparing", label: "Cooking in Kitchen", icon: FaFire },
  { key: "Ready", label: "Ready for Pickup", icon: FaShoppingBag },
  { key: "Completed", label: "Completed", icon: FaUtensils },
];

const getStepIndex = (status) => {
  switch (status) {
    case "Pending":
      return 0;
    case "Confirmed":
      return 1;
    case "Preparing":
      return 2;
    case "Ready":
      return 3;
    case "Completed":
      return 4;
    default:
      return 0;
  }
};

const ViewMyOrder = () => {
  const { currentUser, addToCart, showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "all" | "scheduled"
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userEmail = currentUser?.email || localStorage.getItem("userEmail") || "";

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = userEmail
        ? `/api/order/my-orders?email=${encodeURIComponent(userEmail)}`
        : `/api/order`;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchOrders();

    // Listen to real-time status updates via Socket.IO
    const handleStatusUpdate = (update) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === update.orderId || o.orderNumber === update.orderNumber
            ? { ...o, status: update.status }
            : o
        )
      );
    };

    socket.on("orderStatusUpdated", handleStatusUpdate);
    return () => socket.off("orderStatusUpdated", handleStatusUpdate);
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "active") {
      return o.status !== "Completed" && o.status !== "Cancelled";
    }
    if (activeTab === "scheduled") {
      return o.orderType === "scheduled";
    }
    return true; // "all"
  });

  const handleReorder = (order) => {
    order.items?.forEach((it) => {
      addToCart(it, it.quantity || 1);
    });
    showToast(`Added dishes from order #${order.orderNumber} to cart`, "success");
    navigate("/cart");
  };

  const handleViewReceipt = (order) => {
    localStorage.setItem("receipt", JSON.stringify(order));
    navigate("/receipt");
  };

  return (
    <div className="orders-tracker-root">
      <Navbar />

      <main className="orders-tracker-container">
        <div className="orders-page-top">
          <div>
            <h1>Live Order Tracker 📦</h1>
            <p>Real-time status synced with kitchen counter. Collect your food when marked Ready.</p>
          </div>
          <button className="refresh-orders-btn" onClick={fetchOrders} title="Refresh orders">
            <FaSync className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="orders-tabs-row">
          <button
            className={`order-tab-btn ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            In Progress ({orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length})
          </button>
          <button
            className={`order-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Order History ({orders.length})
          </button>
          <button
            className={`order-tab-btn ${activeTab === "scheduled" ? "active" : ""}`}
            onClick={() => setActiveTab("scheduled")}
          >
            Scheduled Orders
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing orders with canteen database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders-box">
            <FaReceipt className="no-orders-icon" />
            <h3>No {activeTab} orders found</h3>
            <p>When you place an order, you can track the kitchen preparation steps right here.</p>
            <Link to="/menu" className="order-food-link">
              Browse Menu & Order ➔
            </Link>
          </div>
        ) : (
          <div className="orders-list-grid">
            {filteredOrders.map((order) => {
              const currentStep = getStepIndex(order.status);

              return (
                <div key={order._id} className="order-live-card">
                  {/* Card Header */}
                  <div className="order-card-header">
                    <div className="order-id-block">
                      <span className="token-chip">TOKEN</span>
                      <h3>{order.orderNumber || "ORD-000"}</h3>
                      <span className="order-date-tag">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Today"}
                      </span>
                    </div>

                    <div className="order-header-right">
                      <span className={`status-pill-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                      <span className="payment-method-tag">
                        {order.paymentMethod || "UPI"} • {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  <div className="status-stepper-container">
                    <div className="stepper-line-track">
                      <div
                        className="stepper-line-progress"
                        style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                      ></div>
                    </div>

                    <div className="stepper-nodes-row">
                      {statusSteps.map((step, sIdx) => {
                        const isDone = sIdx < currentStep;
                        const isCurrent = sIdx === currentStep;
                        const StepIcon = step.icon;

                        return (
                          <div
                            key={sIdx}
                            className={`stepper-node-wrap ${
                              isDone ? "done" : isCurrent ? "current" : "future"
                            }`}
                          >
                            <div className="stepper-circle">
                              <StepIcon />
                            </div>
                            <span className="stepper-label">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="order-card-items-block">
                    <h4>Dishes ({order.items?.length || 0})</h4>
                    <ul className="items-list-ul">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          <span>
                            <strong>{item.quantity}x</strong> {item.name}
                          </span>
                          <span>₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Footer */}
                  <div className="order-card-footer">
                    <div className="meta-footer-info">
                      <span>📍 {order.tableNumber || "Counter Pickup"}</span>
                      {order.scheduleTime && (
                        <span>⏰ Scheduled for: {order.scheduleTime}</span>
                      )}
                      <span className="order-total-bold">Total: ₹{Number(order.totalAmount).toFixed(2)}</span>
                    </div>

                    <div className="card-actions-group">
                      <button
                        className="view-bill-btn"
                        onClick={() => handleViewReceipt(order)}
                      >
                        <FaReceipt /> View Bill
                      </button>
                      <button
                        className="reorder-action-btn"
                        onClick={() => handleReorder(order)}
                      >
                        🔁 Order Again
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewMyOrder;
