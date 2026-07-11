import React from "react";
import { Routes, Route } from "react-router-dom"; 
import HomePage from "./components/HomePage.js";
import AdminPage from "./components/AdminPage.js";
import MenuPage from "./components/MenuPage.js";
import CartPage from "./components/CartPage.js";
import OrderConfirmation from "./components/OrderConfirmation.js";
import LoginPage from "./components/LoginPage.js";
import PaymentPage from "./components/PaymentPage.js";
import ReceiptPage from "./components/ReceiptPage.js";
import RegisterPage from "./components/RegisterPage.js";
import SignUp from "./components/SignUp.js";
import UsersHomepage from "./components/UsersHomepage.js"
import Favorites from "./components/Favorites.js"
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
import SettingsPage from "./components/SettingsPage.js";
import Logout from "./components/Logout.js";
import RecentOrders from "./components/RecentOrders.js";
import Sidebar from "./components/Sidebar.js";
import ViewMyOrder from "./components/ViewMyOrder.js";

const App = () => {
  return (
    <Routes>
      <Route path="/chatbot" element={<Chatbotpage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/menu" element={<MenuPage/>} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/Payment" element={<PaymentPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/Signup" element={<SignUp />} />
      <Route path="/receipt" element={<ReceiptPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/usershomepage" element={<UsersHomepage />} />
     <Route path="/orderconfirmation" element={<OrderConfirmation />} />
     <Route path="/favorites" element={<Favorites />} />
     <Route path="/forgotpassword" element={<ForgotPassword />} />
     <Route path="/admindashboard" element={<AdminDashboard />} />
     <Route path="/adminlogs" element={<AdminLogs />} />
     <Route path="/notifications" element={<Notifications/>} />
     <Route path="/order" element={<OrderResponse/>} />
     <Route path="/scheduleorder" element={<ScheduleOrder />} />
     <Route path="/securitysettings" element={<SecuritySettings />} />  
     <Route path="/adminlogin" element={<AdminLogin />}/>
     <Route path="/manageroles" element={<ManageRoles />}/>
     <Route path="/specials" element={<Specials />}/>
     <Route path="/feedback" element={<Feedback />}/>
     <Route path="/settingd" element={<SettingsPage />} />
     <Route path="/logout" element={<Logout />} />
<Route path="/recentorders" element={<RecentOrders />} />
<Route path="/sidebar" element={<Sidebar />} />
<Route path="/viewmyorder" element={<ViewMyOrder />} />

    </Routes>
  );
};

export default App;
