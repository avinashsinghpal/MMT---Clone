const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  flightId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Flights',
      key: 'id',
    },
  },
  pnr: {
    type: DataTypes.STRING,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'waitlisted'),
    defaultValue: 'pending',
  },
  seatNumber: {
    type: DataTypes.STRING,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
});

module.exports = Booking;
