import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    alert("🔒 You have been logged out.");
    navigate("/homepage");
  }, [navigate]);

  return null;
};

export default Logout;
