const express = require('express');
const router = express.Router();
const { getFlights } = require('../controllers/flightController');

router.get('/search', getFlights);

module.exports = router;
