const { Queue } = require('bullmq');
const { redis } = require('../utils/lockManager');

// Initialize the Booking Queue
const bookingQueue = new Queue('booking-tasks', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    // Visibility Timeout equivalent in BullMQ is handled by job locking and stalled intervals
    removeOnComplete: true,
  },
});

module.exports = bookingQueue;
