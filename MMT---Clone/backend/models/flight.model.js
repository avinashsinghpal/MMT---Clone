const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightId: { type: String, required: true, unique: true },
  airline: String,
  from: String,
  to: String,
  departureTime: Date,
  arrivalTime: Date,
  price: Number,
  totalCapacity: { type: Number, default: 20 }
});

module.exports = mongoose.model('Flight', flightSchema);
