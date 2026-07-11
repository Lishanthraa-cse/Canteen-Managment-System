import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Table, Form, Card, Modal } from "react-bootstrap";
import "./AdminPage.css"; // Custom CSS

const AdminPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: "", price: "", image: "", availability: true, category: "", timing: "", special: false });
    const [editItem, setEditItem] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/menu");
            setMenuItems(response.data);
        } catch (error) {
            alert("Error fetching menu items!");
        }
    };

    const addMenuItem = async () => {
        try {
            await axios.post("http://localhost:5000/api/menu", newItem);
            fetchMenu();
            setNewItem({ name: "", price: "", image: "", availability: true, category: "", timing: "", special: false });
            alert("Item added successfully!");
        } catch (error) {
            alert("Error adding item!");
        }
    };

    const updateMenuItem = async (id, updatedItem) => {
        try {
            await axios.put(`http://localhost:5000/api/menu/${id}`, updatedItem);
            fetchMenu();
            alert("Item updated successfully!");
        } catch (error) {
            alert("Error updating item!");
        }
    };

    const deleteMenuItem = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/menu/${id}`);
            fetchMenu();
            alert("Item deleted successfully!");
        } catch (error) {
            alert("Error deleting item!");
        }
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setShowEditModal(true);
    };

    const saveEditItem = async () => {
        if (editItem) {
            await updateMenuItem(editItem._id, editItem);
            setShowEditModal(false);
        }
    };

    const categorizedItems = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Admin Panel - Manage Menu</h2>

            <Card className="p-3 mb-4 shadow-lg rounded card-form">
                <h4 className="mb-3">Add New Item</h4>
                <Form>
                    <div className="row g-3">
                        <div className="col-md-2">
                            <Form.Control type="text" placeholder="Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <Form.Control type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <Form.Control type="text" placeholder="Image URL" value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <Form.Control type="text" placeholder="Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
                        </div>
                        <div className="col-md-2">
                            <Form.Control type="text" placeholder="Timing (e.g., 10 AM - 4 PM)" value={newItem.timing} onChange={(e) => setNewItem({ ...newItem, timing: e.target.value })} />
                        </div>
                        
                        <div className="col-md-12 mt-2">
                            <Button className="btn-add" onClick={addMenuItem}>Add Item</Button>
                        </div>
                    </div>
                </Form>
            </Card>

            {Object.keys(categorizedItems).map((category) => (
                <Card key={category} className="mb-4 shadow-lg rounded">
                    <Card.Header className="category-header">{category}</Card.Header>
                    <Card.Body>
                        <Table striped bordered hover className="menu-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Timing</th>
                                    <th>Availability</th>
                                   
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorizedItems[category].map((item) => (
                                    <tr key={item._id}>
                                        <td><img src={item.image} alt={item.name} className="menu-img" /></td>
                                        <td>{item.name}</td>
                                        <td>₹{item.price}</td>
                                        <td>{item.timing}</td>
                                        <td>
                                            <Form.Check type="checkbox" checked={item.availability} onChange={() => updateMenuItem(item._id, { ...item, availability: !item.availability })} />
                                        </td>
                                        <td>
                                            <Form.Check type="checkbox" checked={item.special} onChange={() => updateMenuItem(item._id, { ...item, special: !item.special })} />
                                        </td>
                                        <td>
                                            <Button variant="primary" onClick={() => handleEdit(item)} className="me-2 btn-edit">Edit</Button>
                                            <Button variant="danger" onClick={() => deleteMenuItem(item._id)} className="btn-delete">Delete</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            ))}

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Menu Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editItem && (
                        <Form>
                            <Form.Control type="text" placeholder="Name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className="mb-2" />
                            <Form.Control type="number" placeholder="Price" value={editItem.price} onChange={(e) => setEditItem({ ...editItem, price: e.target.value })} className="mb-2" />
                            <Form.Control type="text" placeholder="Image URL" value={editItem.image} onChange={(e) => setEditItem({ ...editItem, image: e.target.value })} className="mb-2" />
                            <Form.Control type="text" placeholder="Timing" value={editItem.timing} onChange={(e) => setEditItem({ ...editItem, timing: e.target.value })} className="mb-2" />
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
                    <Button variant="primary" onClick={saveEditItem}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPage;
