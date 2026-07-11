import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaPlus, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import "./Specials.css";

const Specials = () => {
  const [specials, setSpecials] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSpecials = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/specials");
      setSpecials(res.data);
    } catch (err) {
      console.error(err);
      setError("⚠️ Failed to load specials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecials();
  }, []);

  const handleAddSpecial = async () => {
    setError("");
    setMessage("");

    if (!name.trim() || !description.trim() || !price) {
      setError("⚠️ Please fill in all fields.");
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      setError("⚠️ Enter a valid price.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/specials", {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
      });
      setMessage("✅ Special added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      fetchSpecials();
    } catch (err) {
      setError("❌ Failed to add special.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/specials/${id}`);
      fetchSpecials();
    } catch (err) {
      setError("❌ Failed to delete special.");
    }
  };

  return (
    <div className="admin-specials-container">
      <h2 className="title">🍽 Admin Specials</h2>

      <div className="form">
        <input
          type="text"
          placeholder="Special Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button onClick={handleAddSpecial}>
          <FaPlus /> Add Special
        </button>
      </div>

      {error && <p className="error"><FaExclamationTriangle /> {error}</p>}
      {message && <p className="success"><FaCheckCircle /> {message}</p>}

      {loading ? (
        <p className="loading">Loading specials...</p>
      ) : specials.length === 0 ? (
        <p className="empty">No specials available.</p>
      ) : (
        <div className="specials-list">
          {specials.map((special) => (
            <div key={special._id} className="special-card">
              <h3>{special.name}</h3>
              <p>{special.description}</p>
              <p className="price">₹{special.price}</p>
              <button
                onClick={() => handleDelete(special._id)}
                className="delete-btn"
              >
                <FaTrashAlt /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Specials;
