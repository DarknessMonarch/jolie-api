const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const predefinedAdminEmail = process.env.ADMIN_EMAIL;  
const predefinedAdminPassword = process.env.ADMIN_PASSWORD;

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (email === predefinedAdminEmail) {
    const match = await bcrypt.compare(password, predefinedAdminPassword);

    if (match) {
      const token = jwt.sign({ id: 'admin' }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(200).json({
        message: "[+] Admin logged in successfully",
        token,
      });
    } else {
      res.status(401).json({ error: "[!] Invalid credentials" });
    }
  } else {
    res.status(401).json({ error: "[!] Invalid credentials" });
  }
};

module.exports = {
  adminLogin,
};
