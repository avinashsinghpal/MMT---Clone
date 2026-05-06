const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flight.controller');

// GET /api/flights/search?from=&to=&date=
router.get('/search', flightController.searchFlights);

module.exports = router;
