const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.id === 'admin') {
        req.user = { id: 'admin', isAdmin: true };
      } else {
        const user = await User.findById(decoded.id).select("-password");
        req.user = user;
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "[!] Login session expired. Please login again." });
      } else {
        return res.status(401).json({ error: "[!] Invalid token" });
      }
    }
  } else {
    return res.status(401).json({ error: "[!] No authorization token provided" });
  }
};

const adminProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.id === 'admin') {
        req.user = { id: 'admin', isAdmin: true };
        next();
      } else {
        const user = await User.findById(decoded.id).select("-password");
        if (user && user.isAdmin) {
          req.user = user;
          next();
        } else {
          return res.status(401).json({ error: "[!] Unauthorized attempt." });
        }
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "[!] Login session expired. Please login again." });
      } else {
        return res.status(401).json({ error: "[!] Invalid token" });
      }
    }
  } else {
    return res.status(401).json({ error: "[!] No authorization token provided" });
  }
};

module.exports = { protect, adminProtect };
