import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MenuProvider } from "./MenuContext.js";
import { AppProvider } from "./context/AppContext.js";
import App from "./App.js";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MenuProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </MenuProvider>
    </BrowserRouter>
  </React.StrictMode>
);
