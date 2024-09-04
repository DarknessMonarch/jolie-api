const express = require("express");
const router = express.Router();
const multer = require('multer');
const {
  createAppointment,
  updateAppointment,
  getAppointment,
  deleteAppointment,
  getAppointments,
  getAppointmentsByDate,
} = require("../controllers/appointmentController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    require('fs').mkdir(uploadPath, { recursive: true }, (err) => cb(err, uploadPath));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


const { adminProtect } = require("../middleware/authMiddleware");

router.route("/").get(getAppointments);

router.route("/create").post(adminProtect, upload.single('categoryImage'), createAppointment);
router.route("/single/:id").get(getAppointment);
router.route("/update/:id").get(adminProtect, updateAppointment);
router.route("/:date").get(getAppointmentsByDate);
router.route("/delete/:id").delete(adminProtect, deleteAppointment);

module.exports = router;
