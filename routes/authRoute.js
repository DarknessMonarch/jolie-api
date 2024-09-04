const express = require("express");
const router = express.Router();


const {
  login,
  getUsers, 
  deleteUser,
  createUser,
  userProfile,
  adminDashboard,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");
const { protect, adminProtect } = require("../middleware/authMiddleware");

router.route("/login").post(login);
router.route("/users").get(getUsers);
router.route("/signup").post(createUser);
router.route("/delete/:id").delete(adminProtect, deleteUser);
router.route("/password-reset").post(requestPasswordReset);
router.route("/reset/:token").post(resetPassword);

router.route("/user/profile").get(protect, userProfile);

router.route("/admin/dashboard").get(adminProtect, adminDashboard);

module.exports = router;
