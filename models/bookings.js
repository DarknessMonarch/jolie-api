const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    phonenumber: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
