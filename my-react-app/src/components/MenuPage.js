import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaSearch } from "react-icons/fa";
import axios from "axios";
import { Card, Button, Row, Col, Form, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MenuPage.css"; // Custom styles

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/menu");
        // Only display items that are available
        setMenuItems(response.data.filter(item => item.availability));
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchMenu();
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || {};
    if (userEmail && savedFavorites[userEmail]) {
      setFavorites(savedFavorites[userEmail]);
    }
  }, [userEmail]);

  const handleOrderNow = (item) => {
    let cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem("cartItems", JSON.stringify(cart));
    navigate("/cart");
  };

  // Updated: Navigate to schedule order page
  const handleScheduledOrder = (item) => {
    localStorage.setItem("scheduledItem", JSON.stringify(item));
    navigate("/scheduleorder");
  };

  const toggleFavorite = (item) => {
    let storedFavorites = JSON.parse(localStorage.getItem("favorites")) || {};
    let userFavorites = storedFavorites[userEmail] || [];
    if (userFavorites.some(fav => fav._id === item._id)) {
      userFavorites = userFavorites.filter(fav => fav._id !== item._id);
      alert("❌ Removed from Favorites");
    } else {
      userFavorites.push(item);
      alert("⭐ Added to Favorites");
    }
    storedFavorites[userEmail] = userFavorites;
    setFavorites(userFavorites);
    localStorage.setItem("favorites", JSON.stringify(storedFavorites));
  };

  const groupedMenu = menuItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <Container className="menu-container mt-4">
      <h2 className="text-center mb-4">📜 Canteen Menu</h2>
      <Form className="search-bar mb-4">
        <div className="search-input">
          <FaSearch className="search-icon" />
          <Form.Control
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Form>
      {Object.keys(groupedMenu).length === 0 ? (
        <p className="text-center">No available menu items.</p>
      ) : (
        Object.keys(groupedMenu).map(category => (
          <div key={category} className="mb-5">
            <h3 className="category-title">🍽️ {category}</h3>
            <Row>
              {groupedMenu[category]
                .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => (
                  <Col key={item._id} md={4} className="mb-4">
                    <Card className="menu-card shadow-sm">
                      <Card.Img
                        variant="top"
                        src={item.image}
                        alt={item.name}
                        height="200px"
                        className="menu-img"
                      />
                      <Card.Body>
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>Price: ₹{item.price}</Card.Text>
                        <Card.Text>Timing: {item.timing}</Card.Text>
                        <Button variant="primary" onClick={() => handleOrderNow(item)}>
                          🛒 Add to Plate
                        </Button>
                        <Button variant="warning" className="ms-2" onClick={() => handleScheduledOrder(item)}>
                          ⏳ Schedule Order
                        </Button>
                        <FaStar
                          className="favorite-star ms-3"
                          color={favorites.some(fav => fav._id === item._id) ? "#FFD700" : "#ccc"}
                          size={24}
                          onClick={() => toggleFavorite(item)}
                          style={{ cursor: "pointer" }}
                        />
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>
        ))
      )}
    </Container>
  );
};

export default MenuPage;
