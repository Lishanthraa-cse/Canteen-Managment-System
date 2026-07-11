const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token", error: error.message });
  }
};

module.exports = authenticateAdmin;
