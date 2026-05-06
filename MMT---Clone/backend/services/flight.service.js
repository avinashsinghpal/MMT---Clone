const axios = require('axios');
const FlightCache = require('../models/flightCache.model');
const Flight = require('../models/flight.model');

const generateRandomPrice = () => {
  // Random price between $100 and $800
  return Math.floor(Math.random() * (800 - 100 + 1) + 100);
};

const getFallbackData = (from, to) => {
  // Fallback static data if both API and Cache fail
  return [
    {
      flightId: 'FB-001',
      airline: 'Fallback Airlines',
      from: from,
      to: to,
      departureTime: new Date().toISOString(),
      arrivalTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      price: generateRandomPrice(),
      totalCapacity: 20
    }
  ];
};

const searchFlights = async (from, to, date) => {
  const cacheKey = `${from}-${to}-${date || 'any'}`.toUpperCase();

  try {
    // 1. Check Cache
    const cachedData = await FlightCache.findOne({ cacheKey });
    if (cachedData) {
      console.log('Serving flights from cache');
      return cachedData.flights;
    }

    // 2. Fetch from Aviationstack API
    console.log('Fetching flights from Aviationstack API');
    const response = await axios.get('http://api.aviationstack.com/v1/flights', {
      params: {
        access_key: process.env.AVIATION_API_KEY,
        dep_iata: from,
        arr_iata: to
      }
    });

    const apiFlights = response.data.data;

    if (!apiFlights || apiFlights.length === 0) {
      return [];
    }

    // 3. Transform API response
    const transformedFlights = apiFlights.map((flight) => {
      return {
        flightId: flight.flight.iata || flight.flight.icao || 'UNKNOWN',
        airline: flight.airline.name || 'Unknown Airline',
        from: flight.departure.iata || from,
        to: flight.arrival.iata || to,
        departureTime: flight.departure.scheduled,
        arrivalTime: flight.arrival.scheduled,
        price: generateRandomPrice(), // Mocked logic
        totalCapacity: 20             // Match the model field
      };
    });

    // 4. Save to Cache (expires in 10 minutes automatically due to TTL index)
    await FlightCache.create({
      cacheKey,
      flights: transformedFlights
    });

    // 5. Upsert directly to main Flight collection
    const bulkOps = transformedFlights.map((flight) => ({
      updateOne: {
        filter: { flightId: flight.flightId },
        update: { $set: flight },
        upsert: true
      }
    }));
    
    if (bulkOps.length > 0) {
      await Flight.bulkWrite(bulkOps);
      console.log(`Saved ${bulkOps.length} flights directly to the DB.`);
    }

    return transformedFlights;

  } catch (error) {
    console.error('Error fetching from Aviationstack API:', error.message);
    
    // 5. If API fails, return fallback static data
    console.log('Returning fallback static data due to API failure');
    const fallbackFlights = getFallbackData(from, to);

    // Ensure fallback is also stored in the db
    const bulkOps = fallbackFlights.map((flight) => ({
      updateOne: {
        filter: { flightId: flight.flightId },
        update: { $set: flight },
        upsert: true
      }
    }));
    await Flight.bulkWrite(bulkOps);

    return fallbackFlights;
  }
};

module.exports = {
  searchFlights
};
