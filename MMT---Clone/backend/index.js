require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route files
const protectedRoutes = require('./routes/protectedRoutes');
const flightRoutes = require('./routes/flight.routes');
const bookingRoutes = require('./routes/booking.routes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());

// Mount webhooks before express.json() to allow raw body parsing
const webhookRoutes = require('./routes/webhook.routes');
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

// Routes
app.use('/api/protected', protectedRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

// Global Error Handler for Clerk authentication errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.message === 'Unauthenticated') {
    return res.status(401).json({ success: false, message: 'Unauthenticated' });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
