import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Container, Row, Col, Image } from "react-bootstrap";
import "./CartPage.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateQuantity = (index, value) => {
    if (value < 1) return;
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = value;
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
  };

  const totalAmount = cartItems
    .reduce((total, item) => total + Number(item.price) * item.quantity, 0)
    .toFixed(2);

  const handleConfirmOrder = () => {
    const orderDetails = { items: cartItems, totalAmount };
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
    navigate("/orderconfirmation");
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center">🛒 Your Cart</h2>
      {cartItems.length === 0 ? (
        <div className="text-center">
          <p>Your cart is empty.</p>
          <Button variant="primary" onClick={() => navigate("/menu")}>
            ➕ Add Items
          </Button>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Image</th>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <Image src={item.image} alt={item.name} width={50} height={50} rounded />
                  </td>
                  <td>{item.name}</td>
                  <td>₹{Number(item.price).toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || 1}
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                      style={{ width: "60px" }}
                    />
                  </td>
                  <td>
                    <Button variant="danger" onClick={() => removeItem(index)}>
                      ❌ Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h3 className="text-end">Total: ₹{totalAmount}</h3>
          <Row className="mt-3 text-center">
            <Col>
              <Button variant="secondary" onClick={() => navigate("/menu")}>
                ➕ Add More Items
              </Button>
            </Col>
            <Col>
              <Button variant="success" onClick={handleConfirmOrder}>
                ✅ Confirm Order
              </Button>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default CartPage;
