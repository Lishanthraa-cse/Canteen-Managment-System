const API_BASE_URL = "http://localhost:5000/api"; // Change this to your backend URL

// ✅ Fetch Menu Items
export const getMenuItems = async () => {
  const response = await fetch(`${API_BASE_URL}/menu`);
  if (!response.ok) {
    throw new Error("Failed to fetch menu items");
  }
  return response.json();
};

// ✅ Fetch Specials of the Day
export const getSpecials = async () => {
  const response = await fetch(`${API_BASE_URL}/specials`);
  if (!response.ok) {
    throw new Error("Failed to fetch specials");
  }
  return response.json();
};

// ✅ User Login API
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }
  return response.json();
};
