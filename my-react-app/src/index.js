import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MenuProvider } from "./MenuContext.js"; // ✅ Import the Provider
import App from "./App.js";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MenuProvider>  {/* ✅ Wrap with MenuProvider */}
        <App />
      </MenuProvider>
    </BrowserRouter>
  </React.StrictMode>
);
