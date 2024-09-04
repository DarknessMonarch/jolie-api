const express = require('express');
const router = express.Router();
const {
  createBooking,
  updateBooking,
  getBooking,
  deleteBooking,
  getAllBookings
} = require('../controllers/bookingController');

router.post('/create', createBooking);

router.put('/update/:id', updateBooking);

router.get('/single/:id', getBooking);

router.delete('/delete/:id', deleteBooking);

router.get('/', getAllBookings);

module.exports = router;
