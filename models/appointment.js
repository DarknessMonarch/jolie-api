const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    categoryImage: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    categoryTime: { type: String, required: true },
    addsOn: [
      {
        title: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
    availableDate: [{ type: Date, required: true }],
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
