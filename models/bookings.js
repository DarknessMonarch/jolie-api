const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    categoryTime: {
      type: String,
      required: true,
    },
    addsOn: [
      {
        title: {
          type: String,
          required: true,
        },
        time: {
          type: String,
          required: true,
        },
      },
    ],
    dateBooked: {
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
