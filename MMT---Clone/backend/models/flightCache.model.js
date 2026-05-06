const mongoose = require('mongoose');

const flightCacheSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true
  },
  flights: {
    type: Array,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Cache expires after 600 seconds (10 minutes)
  }
});

module.exports = mongoose.model('FlightCache', flightCacheSchema);
