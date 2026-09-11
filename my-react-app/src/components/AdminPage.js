import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaSearch,
  FaSync,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import AdminSidebar from "./AdminSidebar";
import "./AdminPage.css";

const AdminPage = () => {
  const { showToast, isDarkMode } = useApp();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    price: "",
    category: "South Indian",
    image: "",
    description: "",
    isVeg: true,
    prepTime: "10 mins",
    availability: true,
  });

  const getHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      showToast("Error loading menu", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      _id: "",
      name: "",
      price: "",
      category: "South Indian",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
      description: "",
      isVeg: true,
      prepTime: "10 mins",
      availability: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      showToast("Please provide dish name and price", "error");
      return;
    }

    try {
      const url = isEditing ? `/api/menu/${formData._id}` : "/api/menu";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(isEditing ? "Dish updated successfully!" : "New dish added to menu!", "success");
        setIsModalOpen(false);
        fetchMenu();
      } else {
        showToast(data.message || "Failed to save dish", "error");
      }
    } catch (err) {
      showToast("Network error saving dish", "error");
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const res = await fetch(`/api/menu/${item._id}/toggle`, {
        method: "PATCH",
        headers: getHeaders(),
      });

      if (res.ok) {
        setMenuItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, availability: !i.availability } : i))
        );
        showToast(`${item.name} marked as ${!item.availability ? "Available" : "Out of Stock"}`, "info");
      }
    } catch (err) {
      showToast("Could not update stock status", "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (res.ok) {
        setMenuItems((prev) => prev.filter((i) => i._id !== id));
        showToast("Dish deleted successfully", "success");
      } else {
        showToast("Failed to delete dish", "error");
      }
    } catch (err) {
      showToast("Network error deleting dish", "error");
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "South Indian", "Meals", "Snacks", "Beverages", "Desserts"];

  return (
    <div className={`admin-portal-root ${isDarkMode ? "dark-theme" : ""}`}>
      <AdminSidebar />
      <div className="admin-main-viewport" style={{ padding: 0 }}>
        <div className="admin-menu-manager-root">
      {/* Top Header */}
      <div className="menu-mgmt-top-nav">
        <Link to="/admindashboard" className="back-dashboard-btn">
          <FaArrowLeft /> Dashboard
        </Link>
        <h2>📋 Menu & Inventory Management</h2>
        <button className="add-new-dish-btn" onClick={handleOpenAdd}>
          <FaPlus /> Add New Dish
        </button>
      </div>

      <main className="menu-mgmt-container">
        {/* Controls */}
        <div className="mgmt-controls-card">
          <div className="mgmt-search-bar">
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Search dish by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mgmt-category-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-pill ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="menu-items-table-card">
          <div className="card-top-info">
            <h3>All Menu Dishes ({filteredItems.length})</h3>
            <button className="refresh-icon-btn" onClick={fetchMenu}>
              <FaSync className={loading ? "spin" : ""} />
            </button>
          </div>

          <div className="table-wrapper">
            <table className="menu-data-table">
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Diet</th>
                  <th>Price</th>
                  <th>Prep Time</th>
                  <th>In Stock</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id} className={!item.availability ? "row-out-stock" : ""}>
                    <td>
                      <div className="dish-cell">
                        <img src={item.image} alt={item.name} className="dish-table-thumb" />
                        <div>
                          <strong>{item.name}</strong>
                          <small className="desc-preview">{item.description}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">{item.category}</span>
                    </td>
                    <td>
                      <span className={`diet-pill ${item.isVeg ? "veg" : "non-veg"}`}>
                        {item.isVeg ? "🌱 Veg" : "🍗 Non-Veg"}
                      </span>
                    </td>
                    <td>
                      <strong className="dish-table-price">₹{item.price}</strong>
                    </td>
                    <td>{item.prepTime || "10 mins"}</td>
                    <td>
                      <button
                        className={`stock-toggle-btn ${item.availability ? "in-stock" : "out-stock"}`}
                        onClick={() => handleToggleAvailability(item)}
                        title="Click to toggle availability"
                      >
                        {item.availability ? "● Available" : "○ Out of Stock"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-actions-cell">
                        <button
                          className="table-action-btn edit"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Dish"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="table-action-btn delete"
                          onClick={() => handleDelete(item._id, item.name)}
                          title="Delete Dish"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="modal-backdrop-overlay">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>{isEditing ? "✏️ Edit Dish" : "➕ Add New Menu Dish"}</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-body">
              <div className="form-group">
                <label>Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa, Cold Coffee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="South Indian">South Indian</option>
                    <option value="Meals">Meals</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={2}
                  placeholder="Crispy, served hot with coconut chutney..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Prep Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 8-10 mins"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    />
                    <span>🌱 Pure Veg Dish</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    />
                    <span>In Stock (Available)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer-btns">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {isEditing ? "Save Changes" : "Create Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
