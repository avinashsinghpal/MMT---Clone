const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_API_URL = 'https://serpapi.com/search.json';

/**
 * Fetches real-time flight data using SerpApi (Google Flights Engine)
 */
const fetchFlightsFromSerpApi = async (from, to, date) => {
  try {
    if (!SERP_API_KEY) {
      console.warn('SERP_API_KEY missing. Falling back to mock data.');
      return getMockFlights(from, to, date);
    }

    console.log(`Fetching flights from Google Flights via SerpApi: ${from} -> ${to} on ${date}`);

    const response = await axios.get(SERP_API_URL, {
      params: {
        engine: 'google_flights',
        departure_id: from,
        arrival_id: to,
        outbound_date: date,
        currency: 'INR',
        hl: 'en',
        gl: 'in',
        api_key: SERP_API_KEY
      }
    });

    const data = response.data;

    if (!data.other_flights && !data.best_flights) {
      console.warn('No flights found in SerpApi response. Check parameters.');
      return getMockFlights(from, to, date);
    }

    // Combine best_flights and other_flights
    const allFlights = [
      ...(data.best_flights || []),
      ...(data.other_flights || [])
    ];

    // Map SerpApi structure to our internal format
    return allFlights.map(f => {
      const flight = f.flights[0]; // Take the first segment for simplicity
      return {
        airline: flight.airline,
        flightNumber: flight.flight_number,
        departure: flight.departure_airport.time,
        arrival: flight.arrival_airport.time,
        duration: f.total_duration ? `${Math.floor(f.total_duration / 60)}h ${f.total_duration % 60}m` : 'N/A',
        price: f.price || 0,
        from: flight.departure_airport.id,
        to: flight.arrival_airport.id,
        date: date,
        type: f.type,
        logo: flight.airline_logo
      };
    });

  } catch (error) {
    console.error('SerpApi Flight Fetch Error:', error.response?.data || error.message);
    return getMockFlights(from, to, date);
  }
};

/**
 * Mock data generator for development and testing
 */
const getMockFlights = (from, to, date) => {
  return [
    {
      airline: 'IndiGo',
      flightNumber: '6E-2134',
      departure: '06:00',
      arrival: '08:15',
      duration: '2h 15m',
      price: 5400,
      from,
      to,
      date,
      logo: 'https://www.gstatic.com/flights/airline_logos/70px/6E.png'
    },
    {
      airline: 'SpiceJet',
      flightNumber: 'SG-8172',
      departure: '07:15',
      arrival: '09:35',
      duration: '2h 20m',
      price: 4900,
      from,
      to,
      date,
      logo: 'https://www.gstatic.com/flights/airline_logos/70px/SG.png'
    }
  ];
};

module.exports = {
  fetchFlightsFromAPI: fetchFlightsFromSerpApi, // Aliasing for the controller
  getMockFlights
};
