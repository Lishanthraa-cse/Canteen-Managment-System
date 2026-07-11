// src/pages/ManageRoles.js
import React, { useState } from "react";
import "./ManageRoles.css"; // optional: for styling

const ManageRoles = () => {
  const [roles, setRoles] = useState([
    { id: 1, name: "Admin", permissions: ["Manage Users", "Edit Menu"] },
    { id: 2, name: "Staff", permissions: ["View Orders"] },
  ]);
  const [newRole, setNewRole] = useState("");
  const [newPermission, setNewPermission] = useState("");

  const handleAddRole = () => {
    if (newRole.trim()) {
      setRoles([...roles, { id: roles.length + 1, name: newRole, permissions: [] }]);
      setNewRole("");
    }
  };

  const handleAddPermission = (roleId) => {
    if (newPermission.trim()) {
      setRoles(
        roles.map((role) =>
          role.id === roleId
            ? { ...role, permissions: [...role.permissions, newPermission] }
            : role
        )
      );
      setNewPermission("");
    }
  };

  return (
    <div className="manage-roles-container">
      <h2>Manage Roles</h2>

      <div className="add-role-form">
        <input
          type="text"
          placeholder="New Role Name"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
        <button onClick={handleAddRole}>Add Role</button>
      </div>

      <div className="roles-list">
        {roles.map((role) => (
          <div key={role.id} className="role-card">
            <h3>{role.name}</h3>
            <ul>
              {role.permissions.map((perm, idx) => (
                <li key={idx}>🔒 {perm}</li>
              ))}
            </ul>
            <div className="add-permission-form">
              <input
                type="text"
                placeholder="Add Permission"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
              />
              <button onClick={() => handleAddPermission(role.id)}>Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageRoles;
