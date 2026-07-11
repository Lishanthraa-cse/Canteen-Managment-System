import React, { useState, useEffect } from "react";
import "./Favorites.css"; // Import CSS file for styling

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const userEmail = localStorage.getItem("userEmail"); // Get logged-in user's email

  // Load favorite items when the component mounts
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || {};
    if (userEmail && storedFavorites[userEmail]) {
      setFavorites(storedFavorites[userEmail]); // Load only the current user's favorites
    }
  }, [userEmail]);

  // Remove item from favorites
  const removeFromFavorites = (item) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== item.id);
    setFavorites(updatedFavorites);

    // Update localStorage
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || {};
    storedFavorites[userEmail] = updatedFavorites;
    localStorage.setItem("favorites", JSON.stringify(storedFavorites));
  };

  return (
    <div className="favorites-page">
      <h2>Your Favorite Items ❤️</h2>

      {favorites.length === 0 ? (
        <p>No favorite items yet. Add some from the menu!</p>
      ) : (
        <ul className="favorites-list">
          {favorites.map((item) => (
            <li key={item.id} className="favorite-item">
              <img src={item.image} alt={item.name} className="fav-img" />
              <div className="fav-details">
                <h3>{item.name}</h3>
                <p>₹{item.price}</p>
                <button onClick={() => removeFromFavorites(item)} className="remove-btn">Remove ❌</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Favorites;
