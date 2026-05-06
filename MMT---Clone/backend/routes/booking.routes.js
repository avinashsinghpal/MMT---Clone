const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { requireAuth, attachUser } = require('../middleware/authMiddleware');

// All booking routes are protected with Clerk middleware
router.use(requireAuth, attachUser);

// POST /api/bookings/hold
router.post('/hold', bookingController.holdSeats);

// POST /api/bookings/confirm
router.post('/confirm', bookingController.confirmBooking);

// GET /api/bookings/user
router.get('/user', bookingController.getUserBookings);

module.exports = router;
