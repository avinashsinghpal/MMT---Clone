const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Flight = sequelize.define('Flight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  airline: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flightNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  origin: {
    type: DataTypes.STRING(3), // IATA Code
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING(3), // IATA Code
    allowNull: false,
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'delayed', 'departed', 'cancelled'),
    defaultValue: 'scheduled',
  },
}, {
  timestamps: true,
});

module.exports = Flight;
