import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom"; 
import HomePage from "./components/HomePage.js";
import AdminPage from "./components/AdminPage.js";
import MenuPage from "./components/MenuPage.js";
import CartPage from "./components/CartPage.js";
import LoginPage from "./components/LoginPage.js";
import PaymentPage from "./components/PaymentPage.js";
import ReceiptPage from "./components/ReceiptPage.js";
import SignUp from "./components/SignUp.js";
import UsersHomepage from "./components/UsersHomepage.js";
import Favorites from "./components/Favorites.js";
import Chatbotpage from "./components/Chatbotpage.js";
import ForgotPassword from "./components/ForgotPassword.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminDashboard from "./components/AdminDashboard.js";
import AdminLogs from "./components/AdminLogs.js";
import Notifications from "./components/Notifications.js";
import OrderResponse from "./components/OrderResponse.js";
import ScheduleOrder from "./components/ScheduleOrder.js";
import SecuritySettings from "./components/SecuritySettings.js";
import AdminLogin from "./components/AdminLogin.js";
import ManageRoles from "./components/ManageRoles.js";
import Specials from "./components/Specials.js";
import Feedback from "./components/Feedback.js";
import Logout from "./components/Logout.js";
import ViewMyOrder from "./components/ViewMyOrder.js";
import DatabaseBackup from "./components/DatabaseBackup.js";
import Settings from "./components/Settings.js";

const App = () => {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/order" ||
    location.pathname === "/kitchen" ||
    location.pathname === "/specials" ||
    location.pathname === "/securitysettings" ||
    location.pathname === "/manageroles" ||
    location.pathname === "/adminlogs" ||
    location.pathname === "/notifications" ||
    location.pathname === "/backup";

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/Payment" element={<PaymentPage />} />
        <Route path="/receipt" element={<ReceiptPage />} />
        <Route path="/orderconfirmation" element={<Navigate to="/receipt" replace />} />
        <Route path="/usershomepage" element={<UsersHomepage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/viewmyorder" element={<ViewMyOrder />} />
        <Route path="/track" element={<ViewMyOrder />} />
        <Route path="/recentorders" element={<ViewMyOrder />} />
        <Route path="/scheduleorder" element={<ScheduleOrder />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/chatbot" element={<Chatbotpage />} />
        <Route path="/settings" element={<Navigate to="/usershomepage" replace />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settingd" element={<Navigate to="/settings" replace />} />

        {/* Admin & Kitchen Routes */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/adminlogs" element={<AdminLogs />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/order" element={<OrderResponse />} />
        <Route path="/kitchen" element={<OrderResponse />} />
        <Route path="/specials" element={<Specials />} />
        <Route path="/securitysettings" element={<SecuritySettings />} />
        <Route path="/manageroles" element={<ManageRoles />} />
        <Route path="/backup" element={<DatabaseBackup />} />
      </Routes>

      {/* Floating AI Canteen Concierge available on customer facing pages */}
      {!isAdminRoute && location.pathname !== "/chatbot" && <Chatbotpage />}
    </>
  );
};

export default App;

