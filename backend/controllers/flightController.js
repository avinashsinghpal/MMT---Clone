const { fetchFlightsFromAPI } = require('../services/flightService');

const getFlights = async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to || !date) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing search parameters: from, to, and date are required.' 
    });
  }

  try {
    // Phase 2: Fetch flights via API (or Mock if API key is missing)
    // This is the fallback because scraping was blocked in the current environment.
    const flights = await fetchFlightsFromAPI(from, to, date);

    // Sort by price by default
    flights.sort((a, b) => a.price - b.price);

    res.json({
      success: true,
      count: flights.length,
      data: flights
    });
  } catch (error) {
    console.error('Flight Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flight details.',
      error: error.message
    });
  }
};

module.exports = {
  getFlights
};
