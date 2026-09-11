const jwt = require("jsonwebtoken");

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Access denied. No authorization token provided." });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "srec_super_secure_jwt_secret_2025"
    );
    req.adminId = decoded.adminId || decoded.id;
    req.adminEmail = decoded.email;
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired authorization token", error: error.message });
  }
};

module.exports = authenticateAdmin;
