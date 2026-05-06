const flightService = require('../services/flight.service');

const searchFlights = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both "from" and "to" IATA codes.'
      });
    }

    const flights = await flightService.searchFlights(from, to, date);

    res.status(200).json({
      success: true,
      data: flights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search flights.',
      error: error.message
    });
  }
};

module.exports = {
  searchFlights
};
