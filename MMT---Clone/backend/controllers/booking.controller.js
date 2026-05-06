const Booking = require('../models/booking.model');
const Flight = require('../models/flight.model');

// Helper to calculate total booked or held seats
const getBookedSeats = async (flightId) => {
  // First, auto-cancel any expired holds for this flight
  await Booking.updateMany(
    { flightId, status: 'HOLD', holdExpiresAt: { $lt: new Date() } },
    { $set: { status: 'CANCELLED' } }
  );

  // Sum active booked or held passengers
  const activeBookings = await Booking.find({
    flightId,
    status: { $in: ['HOLD', 'CONFIRMED'] }
  });

  return activeBookings.reduce((total, booking) => total + booking.passengers.length, 0);
};

// POST /api/bookings/hold
const holdSeats = async (req, res) => {
  try {
    const { flightId, passengers, flightDetails } = req.body;
    const userId = req.user.id; // From Clerk authMiddleware

    if (!flightId || !passengers || passengers.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid booking data' });
    }

    // Upsert the flight details if provided so we can populate it later
    if (flightDetails) {
      await Flight.findOneAndUpdate(
        { flightId },
        { ...flightDetails, flightId },
        { upsert: true, new: true }
      );
    }

    // Prevent Overbooking: Ensure capacity is not exceeded
    const totalCapacity = 20; // Default capacity limit
    const currentBooked = await getBookedSeats(flightId);
    
    if (currentBooked + passengers.length > totalCapacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not enough seats available',
        data: { seatsAvailable: totalCapacity - currentBooked }
      });
    }

    // Set expiration time to 5 minutes from now
    const holdExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const booking = await Booking.create({
      userId,
      flightId,
      passengers,
      status: 'HOLD',
      holdExpiresAt
    });

    res.status(201).json({
      success: true,
      message: 'Seats held successfully for 5 minutes',
      data: booking
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// POST /api/bookings/confirm
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'Booking is already confirmed' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is cancelled' });
    }

    // Expire HOLD if time has passed
    if (booking.status === 'HOLD' && booking.holdExpiresAt < new Date()) {
      booking.status = 'CANCELLED';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Seat hold expired' });
    }

    booking.status = 'CONFIRMED';
    // Optionally clear holdExpiresAt since it's confirmed
    booking.holdExpiresAt = null; 
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// GET /api/bookings/user
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Expire old holds for this user before fetching
    await Booking.updateMany(
      { userId, status: 'HOLD', holdExpiresAt: { $lt: new Date() } },
      { $set: { status: 'CANCELLED' } }
    );

    // Fetch and populate flight details
    const bookings = await Booking.find({ userId })
      .populate('flight')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'User bookings retrieved successfully',
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  holdSeats,
  confirmBooking,
  getUserBookings
};
