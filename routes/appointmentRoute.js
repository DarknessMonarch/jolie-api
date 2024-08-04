const express = require("express");
const router = express.Router();
const {
  createBooking,
  updateBooking,
  getBooking,
  deleteBooking,
} = require("../controllers/appointmentController");
const { adminProtect } = require("../middleware/authMiddleware");

router.route("/create").post(createBooking);

router.route("/update/:id").put(adminProtect, updateBooking);

router.route("/:date/:phonenumber/:email").get(getBooking);

router.route("/delete/:id").delete(adminProtect, deleteBooking);

module.exports = router;
