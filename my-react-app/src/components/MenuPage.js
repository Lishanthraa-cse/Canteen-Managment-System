import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaClock,
  FaStar,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaCalendarAlt,
} from "react-icons/fa";
import { useApp } from "../context/AppContext";
import Navbar from "./Navbar";
import "./MenuPage.css";

const MenuPage = () => {
  const {
    cart,
    addToCart,
    updateQuantity,
    cartCount,
    cartTotal,
    toggleFavorite,
    isFavorite,
    showToast,
    isDarkMode,
  } = useApp();

  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("cat") || "All";

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const navigate = useNavigate();

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

  const categories = useMemo(() => {
    const set = new Set(menuItems.map((i) => i.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        const matchesCategory =
          selectedCategory === "All" ||
          item.category?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVeg = !vegOnly || item.isVeg;

        return matchesCategory && matchesSearch && matchesVeg;
      })
      .sort((a, b) => {
        if (sortBy === "priceAsc") return a.price - b.price;
        if (sortBy === "priceDesc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 4.5) - (a.rating || 4.5);
        return 0;
      });
  }, [menuItems, selectedCategory, searchTerm, vegOnly, sortBy]);

  const getItemCartQuantity = (itemId) => {
    const found = cart.find((i) => i._id === itemId);
    return found ? found.quantity : 0;
  };

  const handleScheduleItem = (item) => {
    localStorage.setItem("scheduledItem", JSON.stringify(item));
    navigate("/scheduleorder");
  };

  return (
    <div className={`menu-page-root ${isDarkMode ? "dark-theme" : ""}`}>
      <Navbar />

      <main className="menu-container">
        {/* Header Title */}
        <div className="menu-header">
          <div className="menu-header-text">
            <h1>Campus Food Menu 🍽️</h1>
            <p>Freshly cooked daily. Choose your meal, customize quantity, and order instantly.</p>
          </div>

          {/* Search & Sort Controls */}
          <div className="menu-controls-row">
            <div className="menu-search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search food, beverages, snacks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="filter-sort-group">
              {/* Veg Only Toggle */}
              <label className="veg-toggle-label">
                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                />
                <span className="veg-chip">🌱 Pure Veg</span>
              </label>

              {/* Sort By */}
              <select
                className="sort-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default Sorting</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated (★)</option>
              </select>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="category-chips-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching today's fresh menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-menu-state">
            <h3>No matching food items found</h3>
            <p>Try adjusting your search query or reset the filters.</p>
            <button
              className="reset-filters-btn"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setVegOnly(false);
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => {
              const qtyInCart = getItemCartQuantity(item._id);
              const favorite = isFavorite(item._id);

              return (
                <div key={item._id} className={`dish-card ${!item.availability ? "out-of-stock" : ""}`}>
                  {/* Image & Badges */}
                  <div className="dish-media">
                    <img src={item.image} alt={item.name} loading="lazy" />

                    <div className="dish-top-badges">
                      {/* Veg / Non-Veg Indicator */}
                      <span className={`diet-badge ${item.isVeg ? "veg" : "non-veg"}`}>
                        <span className="dot"></span>
                      </span>

                      {/* Favorite Heart Button */}
                      <button
                        className={`fav-btn ${favorite ? "active" : ""}`}
                        onClick={() => toggleFavorite(item)}
                        aria-label="Favorite item"
                      >
                        {favorite ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>

                    {!item.availability && (
                      <div className="out-of-stock-overlay">
                        <span>Sold Out Today</span>
                      </div>
                    )}

                    {item.rating && (
                      <span className="rating-pill">
                        <FaStar /> {item.rating}
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="dish-body">
                    <div className="dish-category-tag">{item.category}</div>
                    <h3 className="dish-title">{item.name}</h3>
                    <p className="dish-description">{item.description}</p>

                    <div className="dish-meta-row">
                      <span className="prep-time">
                        <FaClock /> {item.prepTime || "10 mins"}
                      </span>
                      <button
                        className="schedule-btn-link"
                        onClick={() => handleScheduleItem(item)}
                        title="Schedule this meal for a specific time"
                      >
                        <FaCalendarAlt /> Schedule
                      </button>
                    </div>

                    {/* Price & Action Row */}
                    <div className="dish-action-row">
                      <div className="price-wrapper">
                        <span className="currency-symbol">₹</span>
                        <span className="price-number">{item.price}</span>
                      </div>

                      {item.availability ? (
                        qtyInCart > 0 ? (
                          <div className="quantity-stepper">
                            <button
                              onClick={() => updateQuantity(item._id, qtyInCart - 1)}
                              aria-label="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <span className="stepper-qty">{qtyInCart}</span>
                            <button
                              onClick={() => updateQuantity(item._id, qtyInCart + 1)}
                              aria-label="Increase quantity"
                            >
                              <FaPlus />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="add-to-cart-btn"
                            onClick={() => addToCart(item, 1)}
                          >
                            <FaShoppingCart /> Add
                          </button>
                        )
                      ) : (
                        <button className="disabled-btn" disabled>
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Cart Checkout Bar (Visible when cart has items) */}
        {cartCount > 0 && (
          <aside className="floating-cart-bar">
            <div className="cart-bar-left">
              <div className="cart-pill-icon">
                <FaShoppingCart />
                <span className="cart-pill-count">{cartCount}</span>
              </div>
              <div className="cart-bar-details">
                <span className="cart-bar-title">{cartCount} Item{cartCount > 1 ? "s" : ""} Selected</span>
                <span className="cart-bar-total">Payable: ₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/cart" className="view-cart-checkout-btn">
              View Cart & Checkout ➔
            </Link>
          </aside>
        )}
      </main>
    </div>
  );
};

export default MenuPage;
