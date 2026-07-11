import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./OrderResponse.css";

const OrderResponse = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("latest");
  const isFetching = useRef(false);

  useEffect(() => {
    if (!isFetching.current) {
      fetchOrders();
      isFetching.current = true;
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/order");
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleStatusChange = (e) => setFilterStatus(e.target.value);
  const handleSortChange = (e) => setSortBy(e.target.value);

  const filteredOrders = orders
    .filter((order) => order.email?.toLowerCase().includes(search.toLowerCase()))
    .filter((order) =>
      filterStatus === "ALL" ? true : order.paymentStatus === filterStatus
    )
    .sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      return sortBy === "latest" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="order-management-container">
      <h1 className="page-title">🧾 Order Management</h1>

      <div className="controls">
        <input
          type="text"
          placeholder="🔎 Search by email..."
          value={search}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={filterStatus} onChange={handleStatusChange} className="dropdown">
          <option value="ALL">All Orders</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>
        <select value={sortBy} onChange={handleSortChange} className="dropdown">
          <option value="latest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Order Time</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Table</th>
              <th>Items</th>
              <th>Total (₹)</th>
              <th>Payment</th>
              <th>Delivery</th> {/* New column */}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td>{order.orderDate ? new Date(order.orderDate).toLocaleString() : "Invalid Date"}</td>
                  <td>{order.phone || "N/A"}</td>
                  <td>{order.email || "N/A"}</td>
                  <td>{order.tableNumber || "-"}</td>
                  <td>
                    {order.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.name} × {item.quantity}
                      </div>
                    )) || "-"}
                  </td>
                  <td>₹{order.totalAmount?.toFixed(2) || "0.00"}</td>
                  <td>
                    <span className={`badge ${order.paymentStatus === "PAID" ? "badge-paid" : "badge-unpaid"}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${order.isDelivered ? "badge-delivered" : "badge-pending"}`}>
                      {order.isDelivered ? "Delivered" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-orders">
                  No Orders Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderResponse;
