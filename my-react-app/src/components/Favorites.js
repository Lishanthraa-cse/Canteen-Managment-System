import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./Favorites.css";

const Favorites = () => {
  const { favorites, toggleFavorite, addToCart } = useApp();

  return (
    <div className="favorites-page-root">
      <Navbar />

      <main className="favorites-container">
        <div className="favorites-header">
          <Link to="/menu" className="back-link">
            <FaArrowLeft /> Explore Menu
          </Link>
          <h1>Your Favorite Dishes ❤️</h1>
          <p>Quick access to your most-loved campus meals and snacks.</p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-fav-card">
            <FaHeart className="empty-heart-icon" />
            <h2>No favorites saved yet</h2>
            <p>Click the heart icon on any dish in the menu to save it here for fast re-ordering!</p>
            <Link to="/menu" className="browse-btn">
              Browse Canteen Menu ➔
            </Link>
          </div>
        ) : (
          <div className="fav-cards-grid">
            {favorites.map((item) => (
              <div key={item._id} className="fav-item-card">
                <div className="fav-img-box">
                  <img src={item.image} alt={item.name} />
                  <button
                    className="fav-remove-heart"
                    onClick={() => toggleFavorite(item)}
                    title="Remove from favorites"
                  >
                    <FaHeart />
                  </button>
                </div>

                <div className="fav-card-body">
                  <span className="fav-cat">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>

                  <div className="fav-action-row">
                    <span className="fav-price">₹{item.price}</span>
                    <button
                      className="fav-add-cart-btn"
                      onClick={() => addToCart(item, 1)}
                    >
                      <FaShoppingCart /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
