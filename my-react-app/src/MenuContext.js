import React, { createContext, useState } from "react";

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menu, setMenu] = useState([]);

  const addItem = (item) => {
    setMenu([...menu, { ...item, id: Date.now() }]); // ✅ Add unique ID
  };

  const updateItem = (id, updatedItem) => {
    setMenu(menu.map((item) => (item.id === id ? updatedItem : item))); // ✅ Update item
  };

  const deleteItem = (id) => {
    setMenu(menu.filter((item) => item.id !== id)); // ✅ Delete item
  };

  return (
    <MenuContext.Provider value={{ menu, addItem, updateItem, deleteItem }}>
      {children}
    </MenuContext.Provider>
  );
};
