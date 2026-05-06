const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true }
});

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  flightId: { type: String, required: true },
  passengers: [passengerSchema],
  status: {
    type: String,
    enum: ['HOLD', 'CONFIRMED', 'CANCELLED'],
    default: 'HOLD'
  },
  holdExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate to join with Flight model using the string flightId
bookingSchema.virtual('flight', {
  ref: 'Flight',
  localField: 'flightId',
  foreignField: 'flightId',
  justOne: true
});

module.exports = mongoose.model('Booking', bookingSchema);
