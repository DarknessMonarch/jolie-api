const Bookings = require("../models/bookings");
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



const sendEmail = async (email, date) => {
  const username = email.split('@')[0];
  const emailPath = path.join(__dirname, '../client/appointment.html');
  const emailTemplate = fs.readFileSync(emailPath, 'utf-8');
  const personalizedTemplate = emailTemplate.replace('{{username}}', username).replace('{{date}}', date);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Your appointment has been booked!",
    html: personalizedTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("[!] Failed to send email");
  }
};


const convertToISODate = (dateStr) => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}`).toISOString();
};

const createBooking = async (req, res) => {
  const { phonenumber, date, email } = req.body;

  try {
    const isoDate = convertToISODate(date);
    
    const existingBooking = await Bookings.findOne({ phonenumber, date: isoDate, email });
    if (existingBooking) {
      return res.status(400).json({ error: "[!] Booking already exists for this appointment" });
    }

    const booking = await Bookings.create({ phonenumber, date: isoDate, email });

    await sendEmail(email, date);

    res.status(201).json({ ...booking.toObject() });
  } catch (error) {
    res.status(400).json({ error: "[!] An error occurred when creating the booking" });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Bookings.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "[+] Booking not found" });
    }

    const { phonenumber, date, email } = req.body;
    const isoDate = convertToISODate(date);
    const updateFields = { phonenumber, date: isoDate, email };

    const updatedBooking = await Bookings.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
};

const getBooking = async (req, res) => {
  try {
    const isoDate = convertToISODate(req.params.date);
    const booking = await Bookings.findOne({
      date: isoDate,
      phonenumber: req.params.phonenumber,
      email: req.params.email,
    });

    if (!booking) {
      return res.status(404).json({ message: "[+] Booking not found" });
    } else {
      res.status(200).json(booking);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "[!] An error occurred when retrieving the booking" });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Bookings.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "[+] Booking not found" });
    }

    await booking.remove();

    res.status(200).json({ message: "[+] Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "[!] An error occurred when deleting the booking" });
  }
};

module.exports = {
  createBooking,
  updateBooking,
  getBooking,
  deleteBooking,
};
