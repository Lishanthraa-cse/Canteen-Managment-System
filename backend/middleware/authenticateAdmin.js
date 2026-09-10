const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.headers.authorization;
    
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
      return res.status(401).json({ message: "Access denied. No authorization token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    req.admin = decoded;
    req.adminId = decoded.adminId || decoded.id;
    req.adminEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token", error: error.message });
    return res.status(403).json({ message: "Invalid or expired authorization token", error: error.message });
  }
};

module.exports = authenticateAdmin;
