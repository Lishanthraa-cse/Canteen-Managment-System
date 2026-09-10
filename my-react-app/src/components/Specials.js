import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaTrashAlt, FaPlus, FaArrowLeft, FaFire } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import "./Specials.css";

const Specials = () => {
  const { showToast } = useApp();
  const [specials, setSpecials] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("Chef's Special");
  const [loading, setLoading] = useState(false);

  const fetchSpecials = useCallback(async () => {
    try {
      const res = await fetch("/api/specials");
      if (res.ok) {
        const data = await res.json();
        setSpecials(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchSpecials();
  }, [fetchSpecials]);

  const handleAddSpecial = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      showToast("Please provide name and price", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/specials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : null,
          category,
        }),
      });

      if (res.ok) {
        showToast("Special offer added successfully!", "success");
        setName("");
        setDescription("");
        setPrice("");
        setDiscountPrice("");
        fetchSpecials();
      } else {
        showToast("Failed to create special", "error");
      }
    } catch (err) {
      showToast("Network error creating special", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/specials/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSpecials((prev) => prev.filter((s) => s._id !== id));
        showToast("Special offer removed", "info");
      }
    } catch (err) {
      showToast("Error deleting special", "error");
    }
  };

  return (
    <div className="specials-mgmt-root">
      <div className="specials-top-nav">
        <Link to="/admindashboard" className="back-link">
          <FaArrowLeft /> Dashboard
        </Link>
        <h2>🔥 Manage Daily Specials & Deals</h2>
        <div></div>
      </div>

      <main className="specials-container">
        {/* Create Special Card */}
        <div className="specials-form-card">
          <div className="form-title">
            <FaPlus />
            <h3>Create Daily Special Offer</h3>
          </div>

          <form onSubmit={handleAddSpecial} className="special-form">
            <div className="form-grid-2">
              <div className="form-item">
                <label>Offer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Afternoon Combo: Samosa + Tea"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label>Category</label>
                <input
                  type="text"
                  placeholder="e.g. Chef's Special, Combos"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-item">
                <label>Special Offer Price (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label>Original Price (₹) [Strikethrough]</label>
                <input
                  type="number"
                  placeholder="e.g. 55"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="form-item">
              <label>Description & Deal Details</label>
              <textarea
                rows={2}
                placeholder="2 crispy samosas served with hot ginger tea..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-special-btn" disabled={loading}>
              <FaFire /> {loading ? "Creating..." : "Publish Special to Students"}
            </button>
          </form>
        </div>

        {/* Existing Specials */}
        <div className="specials-list-wrap">
          <h3>Active Specials on Student App ({specials.length})</h3>

          <div className="specials-cards-grid">
            {specials.map((s) => (
              <div key={s._id} className="admin-special-card">
                <div className="card-media">
                  <img src={s.image} alt={s.name} />
                  <span className="deal-badge">ACTIVE DEAL</span>
                </div>

                <div className="card-body">
                  <h4>{s.name}</h4>
                  <p>{s.description}</p>

                  <div className="price-row">
                    <div>
                      <strong className="deal-price">₹{s.price}</strong>
                      {s.discountPrice && <span className="cut-price">₹{s.discountPrice}</span>}
                    </div>
                    <button
                      className="delete-special-btn"
                      onClick={() => handleDelete(s._id)}
                      title="Delete special"
                    >
                      <FaTrashAlt /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Specials;
