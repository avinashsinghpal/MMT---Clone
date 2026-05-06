const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { Flight, User, Booking, Waitlist } = require('./models');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/webhooks', webhookRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('MMT Clone API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
