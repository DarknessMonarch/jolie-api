const express = require("express");
const router = express.Router();

const {
  adminLogin,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.route("/admin/login").post(adminLogin);

module.exports = router;
