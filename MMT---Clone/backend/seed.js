require('dotenv').config();
const mongoose = require('mongoose');
const flightService = require('./services/flight.service');
const connectDB = require('./config/db');

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Pushing flights to DB...');
    
    // Seed some common flight routes
    const routes = [
      { from: 'DEL', to: 'BOM' },
      { from: 'JFK', to: 'LHR' },
      { from: 'SFO', to: 'LAX' },
      { from: 'DXB', to: 'LHR' }
    ];

    for (const route of routes) {
      console.log(`Fetching and pushing flights for ${route.from} to ${route.to}...`);
      await flightService.searchFlights(route.from, route.to);
    }

    console.log('Database successfully pushed/seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error pushing to DB:', error);
    process.exit(1);
  }
};

seedDB();
