const Booking = require("../models/bookings");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require('path');
const fs = require('fs');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

const sendEmail = async (email, category, description, categoryTime, addsOn, dateBooked) => {
  const username = email.split('@')[0];
  const emailPath = path.join(__dirname, '../client/booking.html');
  const emailTemplate = fs.readFileSync(emailPath, 'utf-8');

  const formattedAddsOn = addsOn.map(add => `${add.title}: ${add.time}`).join(', ');

  const personalizedTemplate = emailTemplate
    .replace('{{username}}', username)
    .replace('{{category}}', category)
    .replace('{{description}}', description)
    .replace('{{categoryTime}}', categoryTime)
    .replace('{{addsOn}}', formattedAddsOn)
    .replace('{{dateBooked}}', dateBooked);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your appointment has been booked!",
    html: personalizedTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};


const convertToISODate = (dateStr) => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`).toISOString();
};

const createBooking = async (req, res) => {
  const { category, description, categoryTime, addsOn, dateBooked, email } = req.body;

  try {
    const isoDate = convertToISODate(dateBooked);
    
    const existingBooking = await Booking.findOne({ category, dateBooked: isoDate, email });
    if (existingBooking) {
      return res.status(400).json({ error: "Booking already exists for this appointment" });
    }

    const booking = await Booking.create({ category, description, categoryTime, addsOn, dateBooked: isoDate, email });

    await sendEmail(email, category, description, categoryTime, addsOn, dateBooked);

    res.status(201).json({ ...booking.toObject() });
  } catch (error) {
    res.status(400).json({ error: "An error occurred when creating the booking" });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: " Booking not found" });
    }

    const { category, description, categoryTime, addsOn, dateBooked, email } = req.body;
    const isoDate = convertToISODate(dateBooked);
    const updateFields = { category, description, categoryTime, addsOn, dateBooked: isoDate, email };

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
};

const getBooking = async (req, res) => {
  try {
    const isoDate = convertToISODate(req.params.date);
    const booking = await Booking.findOne({
      dateBooked: isoDate,
      category: req.params.category,
      email: req.params.email,
    });

    if (!booking) {
      return res.status(404).json({ message: " Booking not found" });
    } else {
      res.status(200).json(booking);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "An error occurred when retrieving the booking" });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: " Booking not found" });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: " Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "An error occurred when deleting the booking" });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "An error occurred when retrieving all bookings" });
  }
};

module.exports = {
  createBooking,
  updateBooking,
  getBooking,
  deleteBooking,
  getAllBookings,
};
