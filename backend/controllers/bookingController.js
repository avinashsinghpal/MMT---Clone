const { Booking, Flight, Waitlist } = require('../models');
const { lockManager } = require('../utils/lockManager');
const { sequelize } = require('../config/db');
// const bookingQueue = require('../queues/bookingQueue'); // To be implemented

const createBooking = async (req, res) => {
  const { flightId, seatNumber, userId, fareClass } = req.body;
  const resourceId = `flight:${flightId}:seat:${seatNumber || 'any'}`;

  // 1. Acquire Distributed Lock
  const lockAcquired = await lockManager.acquireLock(resourceId, userId);
  if (!lockAcquired) {
    return res.status(423).json({
      success: false,
      message: 'This asset is currently being held by another traveler. Please try again in 10 minutes.'
    });
  }

  const transaction = await sequelize.transaction();

  try {
    // 2. Capacity Analysis (Atomic SQL Check)
    const flight = await Flight.findByPk(flightId, { transaction, lock: true });
    if (!flight) {
      throw new Error('Flight not found');
    }

    const bookingCount = await Booking.count({
      where: { flightId, status: ['confirmed', 'pending'] },
      transaction
    });

    // 3. Determine Booking vs Waitlist
    let bookingStatus = 'pending';
    if (bookingCount >= flight.capacity) {
      bookingStatus = 'waitlisted';
      
      // Handle Waitlist Logic
      await Waitlist.create({
        userId,
        flightId,
        priorityScore: fareClass === 'premium' ? 100 : 0,
        status: 'active'
      }, { transaction });

      await transaction.commit();
      // Release lock early for waitlist as seat isn't reserved
      await lockManager.releaseLock(resourceId, userId);

      return res.status(202).json({
        success: true,
        message: 'Flight is at capacity. You have been added to the waitlist.',
        status: 'waitlisted'
      });
    }

    // 4. Create Pending Booking
    const booking = await Booking.create({
      userId,
      flightId,
      seatNumber,
      status: 'pending',
      totalAmount: flight.basePrice, // Simplification
      paymentStatus: 'pending'
    }, { transaction });

    await transaction.commit();

    // 5. Dispatch Asynchronous Task (System Decoupling)
    // await bookingQueue.add('process-booking', { bookingId: booking.id, userId });

    res.status(201).json({
      success: true,
      message: 'Booking initiated. Please complete payment within 10 minutes.',
      data: booking
    });

  } catch (error) {
    await transaction.rollback();
    await lockManager.releaseLock(resourceId, userId);
    
    console.error('Booking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking
};
